// src/common/utils/ssrf.util.ts
import { promises as dns } from 'node:dns';
import { isIP } from 'node:net';
import { BadRequestException } from '@nestjs/common';

const PRIVATE_IP_PATTERNS = [
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^127\.\d+\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fe80:/i,
];

const BLOCKED_HOSTS = new Set([
  'localhost', 'metadata.google.internal',
  '169.254.169.254', 'metadata.internal',
]);

export async function validateExternalUrl(urlString: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new BadRequestException('Invalid URL format');
  }

  if (url.protocol !== 'https:') {
    throw new BadRequestException('Only HTTPS URLs are allowed');
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTS.has(hostname)) {
    throw new BadRequestException('Access to this host is not allowed');
  }

  if (isIP(hostname)) {
    if (PRIVATE_IP_PATTERNS.some((p) => p.test(hostname))) {
      throw new BadRequestException('Access to private IP ranges is not allowed');
    }
  } else {
    try {
      const { address } = await dns.lookup(hostname);
      if (PRIVATE_IP_PATTERNS.some((p) => p.test(address))) {
        throw new BadRequestException('URL resolves to a private IP address');
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Failed to resolve hostname');
    }
  }

  return url;
}
