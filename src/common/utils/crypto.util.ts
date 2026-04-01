// src/common/utils/crypto.util.ts
import argon2 from 'argon2';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
  });
};

export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export const encryptOAuthToken = (plaintext: string, keyHex: string): string => {
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== KEY_LENGTH) throw new Error('Invalid encryption key length');

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('hex');
};

export const decryptOAuthToken = (encryptedHex: string, keyHex: string): string => {
  const key = Buffer.from(keyHex, 'hex');
  const data = Buffer.from(encryptedHex, 'hex');

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
};

export const generateSecureToken = (length = 64): string => {
  return randomBytes(length).toString('hex');
};
