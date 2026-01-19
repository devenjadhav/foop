import crypto from 'crypto';

export interface SignatureOptions {
  algorithm?: 'sha256' | 'sha512';
  encoding?: 'hex' | 'base64';
  timestampTolerance?: number;
}

const DEFAULT_OPTIONS: Required<SignatureOptions> = {
  algorithm: 'sha256',
  encoding: 'hex',
  timestampTolerance: 300000, // 5 minutes in milliseconds
};

export function createSignature(
  payload: string,
  secret: string,
  timestamp: string,
  options: SignatureOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const signedPayload = `${timestamp}.${payload}`;

  const hmac = crypto.createHmac(opts.algorithm, secret);
  hmac.update(signedPayload);

  return hmac.digest(opts.encoding);
}

export function createSignatureHeader(
  payload: string,
  secret: string,
  options: SignatureOptions = {}
): { signature: string; timestamp: string; header: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const timestamp = Date.now().toString();
  const signature = createSignature(payload, secret, timestamp, opts);

  const header = `t=${timestamp},v1=${signature}`;

  return { signature, timestamp, header };
}

export function parseSignatureHeader(header: string): {
  timestamp: string | null;
  signatures: string[];
} {
  const parts = header.split(',');
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      timestamp = value;
    } else if (key.startsWith('v')) {
      signatures.push(value);
    }
  }

  return { timestamp, signatures };
}

export function verifySignature(
  payload: string,
  secret: string,
  signatureHeader: string,
  options: SignatureOptions = {}
): { valid: boolean; error?: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const { timestamp, signatures } = parseSignatureHeader(signatureHeader);

  if (!timestamp) {
    return { valid: false, error: 'Missing timestamp in signature header' };
  }

  if (signatures.length === 0) {
    return { valid: false, error: 'Missing signature in header' };
  }

  const timestampMs = parseInt(timestamp, 10);
  if (isNaN(timestampMs)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }

  const now = Date.now();
  if (Math.abs(now - timestampMs) > opts.timestampTolerance) {
    return { valid: false, error: 'Timestamp outside tolerance window' };
  }

  const expectedSignature = createSignature(payload, secret, timestamp, opts);

  const isValid = signatures.some((sig) =>
    crypto.timingSafeEqual(
      Buffer.from(sig, opts.encoding),
      Buffer.from(expectedSignature, opts.encoding)
    )
  );

  if (!isValid) {
    return { valid: false, error: 'Signature mismatch' };
  }

  return { valid: true };
}

export function verifyTimestamp(
  timestamp: string,
  toleranceMs: number = DEFAULT_OPTIONS.timestampTolerance
): { valid: boolean; error?: string } {
  const timestampMs = parseInt(timestamp, 10);

  if (isNaN(timestampMs)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }

  const now = Date.now();
  if (Math.abs(now - timestampMs) > toleranceMs) {
    return { valid: false, error: 'Timestamp outside tolerance window' };
  }

  return { valid: true };
}
