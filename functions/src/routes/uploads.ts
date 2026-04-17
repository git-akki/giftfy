import { Hono } from 'hono';
import { randomBytes } from 'crypto';
import { db, bucket } from '../lib/admin';
import { notFound, forbidden, badRequest, err } from '../lib/errors';
import { requireAuth, AuthEnv } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
] as const;

type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
};

const uploads = new Hono<AuthEnv>();

uploads.use('*', requireAuth);
uploads.use('*', rateLimit('upload'));

// POST /presigned-url
uploads.post('/presigned-url', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json().catch(() => ({}));
    const { giftId, fileType, fileName, fileSize } = body as {
      giftId?: string;
      fileType?: string;
      fileName?: string;
      fileSize?: number;
    };

    if (!giftId || typeof giftId !== 'string') {
      throw badRequest('giftId is required');
    }

    if (!fileType || !ALLOWED_FILE_TYPES.includes(fileType as AllowedFileType)) {
      throw badRequest(
        `fileType must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`
      );
    }

    if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
      throw badRequest('File size exceeds 10MB limit');
    }

    // Verify gift exists and belongs to user
    const giftSnap = await db.collection('celebrations').doc(giftId).get();
    if (!giftSnap.exists) throw notFound('Gift not found');
    if (giftSnap.data()?.creatorId !== userId) throw forbidden();

    // Generate unique file path
    const ext = EXTENSION_MAP[fileType] ?? 'bin';
    const uniqueName = randomBytes(16).toString('hex');
    const safeFileName = fileName
      ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 50)
      : `${uniqueName}.${ext}`;
    const path = `gifts/${giftId}/uploads/${uniqueName}_${safeFileName}`;

    // Generate GCS v4 signed URL (15 min expiry, write action)
    const file = bucket.file(path);
    const expiresIn = 15 * 60; // 15 minutes in seconds

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresIn * 1000,
      contentType: fileType,
    });

    const bucketName = bucket.name;
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${path}`;

    return c.json({ uploadUrl, publicUrl, path, expiresIn }, 200);
  } catch (e) {
    return err(c, e);
  }
});

export default uploads;
