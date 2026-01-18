import * as crypto from 'crypto';

// TODO: In production, ensure ENCRYPTION_KEY is set in environment variables
// It must be exactly 32 characters long for aes-256-cbc
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; 
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt a string using AES-256-CBC
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    // Use Buffer.from(ENCRYPTION_KEY) directly if it's 32 chars, or hash it if not guaranteed
    // For simplicity/safety, we'll hash the key to ensure 32 bytes if it's not perfect,
    // but ideally we provide a 32-char key.
    // Let's assume strict 32 chars or use crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest()
    
    // Safer approach: derive a 32 byte key from the env var
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt a string using AES-256-CBC
 */
export function decrypt(text: string): string {
  if (!text) return text;
  
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) {
      // If it's not in iv:encrypted format, assume it's legacy/plain text or return as is
      return text;
    }
    
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    // Fallback: return or throw. If we assume DB has mix of plain/encrypted, we might return text
    // But for security, failing is often better.
    return text;
  }
}
