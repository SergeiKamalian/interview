import type { Request, Response } from 'express';
import { REFRESH_TOKEN_COOKIE } from '../constants';

function parseCookieHeader(
  cookieHeader: string | undefined,
): Map<string, string> {
  const values = new Map<string, string>();
  if (!cookieHeader) {
    return values;
  }

  for (const pair of cookieHeader.split(';')) {
    const [namePart, ...valueParts] = pair.trim().split('=');
    if (!namePart || valueParts.length === 0) {
      continue;
    }

    values.set(namePart, decodeURIComponent(valueParts.join('=')));
  }

  return values;
}

export function getCookieValue(
  request: Request,
  cookieName: string,
): string | undefined {
  return parseCookieHeader(request.headers.cookie).get(cookieName);
}

export function setRefreshTokenCookie(
  response: Response,
  refreshToken: string,
  options: { secure: boolean; maxAgeMs: number },
): void {
  response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: options.secure,
    path: '/',
    maxAge: options.maxAgeMs,
  });
}

export function clearRefreshTokenCookie(
  response: Response,
  secure: boolean,
): void {
  response.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  });
}
