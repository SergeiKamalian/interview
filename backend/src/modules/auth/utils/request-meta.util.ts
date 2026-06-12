import type { Request } from 'express';

export type RequestMeta = {
  userAgent: string | null;
  ip: string | null;
};

export function extractRequestMeta(request: Request): RequestMeta {
  const userAgentHeader = request.headers['user-agent'];
  let userAgent: string | null = null;

  if (typeof userAgentHeader === 'string') {
    userAgent =
      userAgentHeader.length > 512
        ? userAgentHeader.slice(0, 512)
        : userAgentHeader;
  }

  const forwardedFor = request.headers['x-forwarded-for'];
  let ip: string | null = null;

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    ip = forwardedFor.split(',')[0]?.trim() ?? null;
  } else if (typeof request.ip === 'string' && request.ip.length > 0) {
    ip = request.ip;
  }

  if (ip && ip.length > 45) {
    ip = ip.slice(0, 45);
  }

  return { userAgent, ip };
}
