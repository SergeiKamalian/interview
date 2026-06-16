import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  getElevenLabsBaseUrl,
  type ElevenLabsConfig,
} from '../../common/config/elevenlabs.schema';
import { ElevenLabsConfigService } from './elevenlabs.config';

export type ElevenLabsTtsStreamResult = {
  mimeType: string;
  chunks: Buffer[];
};

const MIME_BY_FORMAT: Record<string, string> = {
  mp3: 'audio/mpeg',
  pcm: 'audio/pcm',
  opus: 'audio/opus',
  ulaw: 'audio/basic',
  alaw: 'audio/basic',
};

type ElevenLabsVoiceSettings = {
  stability: number;
  similarity_boost: number;
  use_speaker_boost: boolean;
};

const DEFAULT_VOICE_SETTINGS: ElevenLabsVoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.8,
  use_speaker_boost: false,
};

/** Lower stability + pauses → more natural hesitation while AI processes. */
const THINKING_VOICE_SETTINGS: ElevenLabsVoiceSettings = {
  stability: 0.32,
  similarity_boost: 0.72,
  use_speaker_boost: false,
};

@Injectable()
export class ElevenLabsTtsService {
  private readonly logger = new Logger(ElevenLabsTtsService.name);
  private readonly cache = new Map<string, Buffer>();
  private readonly maxCacheEntries = 64;

  constructor(private readonly elevenLabsConfigService: ElevenLabsConfigService) {}

  isEnabled(): boolean {
    return this.elevenLabsConfigService.isTtsEnabled();
  }

  normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  async *streamText(
    text: string,
  ): AsyncGenerator<Buffer, ElevenLabsTtsStreamResult, void> {
    if (!this.isEnabled()) {
      return { mimeType: 'audio/mpeg', chunks: [] };
    }

    const config = this.elevenLabsConfigService.getConfig();
    const normalized = this.normalizeText(text);

    if (!normalized) {
      return { mimeType: resolveMimeType(config.outputFormat), chunks: [] };
    }

    if (normalized.length > config.maxTextLength) {
      throw new Error(
        `TTS text exceeds max length (${config.maxTextLength} characters)`,
      );
    }

    const cacheKey = this.buildCacheKey(config, normalized, DEFAULT_VOICE_SETTINGS);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      yield cached;
      return { mimeType: resolveMimeType(config.outputFormat), chunks: [cached] };
    }

    const chunks: Buffer[] = [];
    for await (const chunk of this.fetchStream(
      config,
      normalized,
      DEFAULT_VOICE_SETTINGS,
    )) {
      chunks.push(chunk);
      yield chunk;
    }

    if (chunks.length > 0) {
      this.rememberCache(cacheKey, Buffer.concat(chunks));
    }

    return { mimeType: resolveMimeType(config.outputFormat), chunks };
  }

  async synthesizeToBuffer(text: string): Promise<Buffer> {
    if (!this.isEnabled()) {
      return Buffer.alloc(0);
    }

    const config = this.elevenLabsConfigService.getConfig();
    const normalized = this.normalizeText(text);
    if (!normalized) {
      return Buffer.alloc(0);
    }

    const cacheKey = this.buildCacheKey(config, normalized, DEFAULT_VOICE_SETTINGS);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of this.fetchStream(
      config,
      normalized,
      DEFAULT_VOICE_SETTINGS,
    )) {
      chunks.push(chunk);
    }

    if (chunks.length === 0) {
      return Buffer.alloc(0);
    }

    const buffer = Buffer.concat(chunks);
    this.rememberCache(cacheKey, buffer);
    return buffer;
  }

  formatThinkingPhrase(phrase: string): string {
    const trimmed = this.normalizeText(phrase);
    if (!trimmed) {
      return trimmed;
    }

    if (trimmed.includes('<break')) {
      return trimmed;
    }

    return trimmed.replace(
      /\.\.\.\s+(?=\S)/g,
      '... <break time="0.9s" /> ',
    );
  }

  async synthesizeThinkingToBuffer(phrase: string): Promise<Buffer> {
    if (!this.isEnabled()) {
      return Buffer.alloc(0);
    }

    const config = this.elevenLabsConfigService.getConfig();
    const text = this.formatThinkingPhrase(phrase);
    if (!text) {
      return Buffer.alloc(0);
    }

    const cacheKey = this.buildCacheKey(
      config,
      text,
      THINKING_VOICE_SETTINGS,
      'thinking',
    );
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of this.fetchStream(
      config,
      text,
      THINKING_VOICE_SETTINGS,
    )) {
      chunks.push(chunk);
    }

    if (chunks.length === 0) {
      return Buffer.alloc(0);
    }

    const buffer = Buffer.concat(chunks);
    this.rememberCache(cacheKey, buffer);
    return buffer;
  }

  private async *fetchStream(
    config: ElevenLabsConfig,
    text: string,
    voiceSettings: ElevenLabsVoiceSettings = DEFAULT_VOICE_SETTINGS,
  ): AsyncGenerator<Buffer, void, void> {
    const url = new URL(
      `${getElevenLabsBaseUrl()}/text-to-speech/${encodeURIComponent(config.voiceId)}/stream`,
    );
    url.searchParams.set('output_format', config.outputFormat);
    url.searchParams.set(
      'optimize_streaming_latency',
      String(config.optimizeStreamingLatency),
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': config.apiKey,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: config.modelId,
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.warn(
        `ElevenLabs TTS failed status=${response.status} body=${errorBody.slice(0, 300)}`,
      );
      throw new Error(`ElevenLabs TTS request failed (${response.status})`);
    }

    if (!response.body) {
      throw new Error('ElevenLabs TTS response body is empty');
    }

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      if (value && value.byteLength > 0) {
        yield Buffer.from(value);
      }
    }
  }

  private buildCacheKey(
    config: ElevenLabsConfig,
    text: string,
    voiceSettings: ElevenLabsVoiceSettings,
    scope = 'tts',
  ): string {
    const payload = [
      scope,
      config.voiceId,
      config.modelId,
      config.outputFormat,
      voiceSettings.stability,
      voiceSettings.similarity_boost,
      voiceSettings.use_speaker_boost,
      text,
    ].join('|');
    return createHash('sha256').update(payload).digest('hex');
  }

  private rememberCache(key: string, value: Buffer): void {
    if (this.cache.size >= this.maxCacheEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, value);
  }
}

function resolveMimeType(outputFormat: string): string {
  const codec = outputFormat.split('_')[0]?.toLowerCase() ?? 'mp3';
  return MIME_BY_FORMAT[codec] ?? 'audio/mpeg';
}
