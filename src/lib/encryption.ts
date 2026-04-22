// End-to-End Encryption utilities using TweetNaCl.js
// For encrypting sensitive messages and personal data

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

/**
 * Generate a keypair for E2E encryption
 * Returns: { publicKey: string, secretKey: string }
 */
export function generateKeyPair() {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
}

/**
 * Encrypt a message using recipient's public key
 * @param plaintext - Message to encrypt
 * @param recipientPublicKey - Recipient's public key (base64)
 * @param senderSecretKey - Sender's secret key (base64)
 * @returns Encrypted message object { nonce, encryptedMessage, ephemeralPublicKey }
 */
export function encryptMessage(
  plaintext: string,
  recipientPublicKey: string,
  senderSecretKey: string
) {
  try {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const ephemeralKeyPair = nacl.box.keyPair();
    
    const encryptedMessage = nacl.box(
      Buffer.from(plaintext, 'utf-8'),
      nonce,
      decodeBase64(recipientPublicKey),
      decodeBase64(senderSecretKey)
    );

    return {
      nonce: encodeBase64(nonce),
      encryptedMessage: encodeBase64(encryptedMessage),
      ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey),
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message using your secret key
 * @param encrypted - Encrypted message object
 * @param recipientSecretKey - Your secret key (base64)
 * @param senderPublicKey - Sender's public key (base64)
 * @returns Decrypted message string
 */
export function decryptMessage(
  encrypted: {
    nonce: string;
    encryptedMessage: string;
    ephemeralPublicKey: string;
  },
  recipientSecretKey: string,
  senderPublicKey: string
) {
  try {
    const decrypted = nacl.box.open(
      decodeBase64(encrypted.encryptedMessage),
      decodeBase64(encrypted.nonce),
      decodeBase64(senderPublicKey),
      decodeBase64(recipientSecretKey)
    );

    if (!decrypted) {
      throw new Error('Decryption failed: invalid message');
    }

    return Buffer.from(decrypted).toString('utf-8');
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Encrypt a string (symmetric encryption)
 * Useful for storing sensitive user data
 */
export function encryptData(plaintext: string, password: string) {
  // Generate key from password
  const key = nacl.hash(Buffer.from(password, 'utf-8')).slice(0, nacl.secretbox.keyLength);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  
  const encrypted = nacl.secretbox(
    Buffer.from(plaintext, 'utf-8'),
    nonce,
    key
  );

  return {
    nonce: encodeBase64(nonce),
    encryptedData: encodeBase64(encrypted),
  };
}

/**
 * Decrypt data using password
 */
export function decryptData(
  encrypted: { nonce: string; encryptedData: string },
  password: string
) {
  const key = nacl.hash(Buffer.from(password, 'utf-8')).slice(0, nacl.secretbox.keyLength);
  
  const decrypted = nacl.secretbox.open(
    decodeBase64(encrypted.encryptedData),
    decodeBase64(encrypted.nonce),
    key
  );

  if (!decrypted) {
    throw new Error('Decryption failed');
  }

  return Buffer.from(decrypted).toString('utf-8');
}

/**
 * Hash a password for secure storage (one-way, can't be decrypted)
 * Use for password verification
 */
export function hashPassword(password: string): string {
  return encodeBase64(nacl.hash(Buffer.from(password, 'utf-8')));
}

/**
 * Store secret key securely in IndexedDB
 * Encrypted with a password
 */
export async function storeSecretKeySecurely(
  userId: string,
  secretKey: string,
  password: string
) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyConnectDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      
      // Create object store if not exists
      if (!db.objectStoreNames.contains('keys')) {
        db.close();
        return reject(new Error('Store not found'));
      }

      const tx = db.transaction('keys', 'readwrite');
      const store = tx.objectStore('keys');
      
      const encryptedKey = encryptData(secretKey, password);
      store.put({ userId, ...encryptedKey });

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    };
  });
}

/**
 * Retrieve secret key from IndexedDB
 */
export async function retrieveSecretKey(
  userId: string,
  password: string
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyConnectDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('keys')) {
        db.close();
        return resolve(null);
      }

      const tx = db.transaction('keys', 'readonly');
      const store = tx.objectStore('keys');
      const keyRequest = store.get(userId);

      keyRequest.onsuccess = () => {
        if (keyRequest.result) {
          try {
            const decrypted = decryptData(
              {
                nonce: keyRequest.result.nonce,
                encryptedData: keyRequest.result.encryptedData,
              },
              password
            );
            resolve(decrypted);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      };

      keyRequest.onerror = () => reject(keyRequest.error);
    };
  });
}
