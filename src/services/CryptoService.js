/**
 * CryptoService - Encrypts/decrypts API keys using Web Crypto API (AES-GCM).
 *
 * On first use a random 256-bit AES key is generated and persisted in
 * localStorage (base64, key: 'ies_crypto_key').  When crypto.subtle is
 * unavailable (e.g. file:// protocol) the service falls back to plain
 * base64 encoding and logs a warning.
 */

const STORAGE_KEY = 'ies_crypto_key';

class CryptoService {
  constructor() {
    /** @type {CryptoKey|null} */
    this._key = null;
    /** Whether Web Crypto API is available */
    this._hasCrypto = !!(
      typeof window !== 'undefined' &&
      window.crypto &&
      window.crypto.subtle
    );
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Initialise the service: load an existing key from localStorage or generate
   * a new one.  Must be called (and awaited) before encrypt / decrypt.
   */
  async init() {
    if (!this._hasCrypto) {
      console.warn(
        '[CryptoService] Web Crypto API is not available (likely file:// protocol). ' +
        'Falling back to base64 encoding. API keys will NOT be securely encrypted.'
      );
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      this._key = await this._importKey(stored);
    } else {
      this._key = await this._generateKey();
      const exported = await this._exportKey(this._key);
      localStorage.setItem(STORAGE_KEY, exported);
    }
  }

  /**
   * Encrypt a plaintext string.
   * @param {string} plaintext
   * @returns {Promise<{iv: string, ciphertext: string}>}  Both values are base64.
   */
  async encrypt(plaintext) {
    if (!this._hasCrypto) {
      // Fallback: base64 encode only
      return {
        iv: '',
        ciphertext: btoa(unescape(encodeURIComponent(plaintext))),
      };
    }

    if (!this._key) {
      throw new Error('[CryptoService] Not initialised. Call init() first.');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // 96-bit IV recommended for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this._key,
      data,
    );

    return {
      iv: this._arrayBufferToBase64(iv),
      ciphertext: this._arrayBufferToBase64(encrypted),
    };
  }

  /**
   * Decrypt a previously-encrypted payload.
   * @param {{iv: string, ciphertext: string}} payload  Base64 strings.
   * @returns {Promise<string>}  The original plaintext.
   */
  async decrypt({ iv, ciphertext }) {
    if (!this._hasCrypto) {
      // Fallback: base64 decode
      return decodeURIComponent(escape(atob(ciphertext)));
    }

    if (!this._key) {
      throw new Error('[CryptoService] Not initialised. Call init() first.');
    }

    const ivBuffer = this._base64ToArrayBuffer(iv);
    const dataBuffer = this._base64ToArrayBuffer(ciphertext);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      this._key,
      dataBuffer,
    );

    return new TextDecoder().decode(decrypted);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /** Generate a new random AES-GCM 256-bit key. */
  async _generateKey() {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true, // extractable so we can export it
      ['encrypt', 'decrypt'],
    );
  }

  /** Export a CryptoKey to a base64 string (raw format). */
  async _exportKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return this._arrayBufferToBase64(raw);
  }

  /** Import a base64-encoded raw key back into a CryptoKey. */
  async _importKey(base64) {
    const raw = this._base64ToArrayBuffer(base64);
    return crypto.subtle.importKey(
      'raw',
      raw,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  /** Convert an ArrayBuffer / TypedArray to a base64 string. */
  _arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /** Convert a base64 string back to an ArrayBuffer. */
  _base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Export a singleton for convenient app-wide usage, plus the class itself.
const cryptoService = new CryptoService();
export { CryptoService };
export default cryptoService;
