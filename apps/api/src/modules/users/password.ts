import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const keyLength = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, keyLength)) as Buffer;
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, hashHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hashHex || !/^[0-9a-f]{128}$/.test(hashHex)) {
    return false;
  }

  const expected = Buffer.from(hashHex, 'hex');
  const actual = (await scryptAsync(password, salt, keyLength)) as Buffer;
  return timingSafeEqual(expected, actual);
}
