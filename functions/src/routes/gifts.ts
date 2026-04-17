import { Hono } from 'hono';
import { randomBytes } from 'crypto';
import { db } from '../lib/admin';
import { notFound, forbidden, badRequest, err } from '../lib/errors';
import { requireAuth, AuthEnv } from '../middleware/auth';
import { idempotency } from '../middleware/idempotency';

// Generate a URL-safe slug (nanoid-equivalent using crypto)
function generateSlug(length = 12): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length * 2);
  let slug = '';
  for (let i = 0; i < bytes.length && slug.length < length; i++) {
    const idx = bytes[i] % alphabet.length;
    slug += alphabet[idx];
  }
  return slug;
}

const UPDATABLE_FIELDS = [
  'recipientName',
  'occasion',
  'vibe',
  'template',
  'tier',
] as const;

const gifts = new Hono<AuthEnv>();

gifts.use('*', requireAuth);

// POST / — create gift
gifts.post('/', idempotency, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json().catch(() => ({}));
    const {
      recipientName,
      occasion,
      vibe,
      template,
      tier,
    } = body as {
      recipientName?: string;
      occasion?: string;
      vibe?: string;
      template?: string;
      tier?: string;
    };

    if (!recipientName || typeof recipientName !== 'string' || recipientName.trim().length === 0) {
      throw badRequest('recipientName is required');
    }

    const slug = generateSlug(12);
    const now = new Date().toISOString();

    const gift = {
      creatorId: userId,
      recipientName: recipientName.trim(),
      occasion: occasion ?? null,
      slug,
      status: 'draft',
      vibe: vibe ?? null,
      template: template ?? null,
      tier: tier ?? null,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };

    const ref = await db.collection('celebrations').add(gift);

    return c.json({ id: ref.id, ...gift }, 201);
  } catch (e) {
    return err(c, e);
  }
});

// GET / — list creator's gifts
gifts.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const snap = await db
      .collection('celebrations')
      .where('creatorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return c.json({ gifts: items });
  } catch (e) {
    return err(c, e);
  }
});

// GET /:id — get gift with slides
gifts.get('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    const ref = db.collection('celebrations').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw notFound('Gift not found');
    if (snap.data()?.creatorId !== userId) throw forbidden();

    // Fetch slides subcollection
    const slidesSnap = await ref
      .collection('slides')
      .orderBy('sortOrder', 'asc')
      .get();

    const slides = slidesSnap.docs.map((s) => ({ id: s.id, ...s.data() }));

    return c.json({ id: snap.id, ...snap.data(), slides });
  } catch (e) {
    return err(c, e);
  }
});

// PATCH /:id — update whitelisted fields
gifts.patch('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    const ref = db.collection('celebrations').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw notFound('Gift not found');
    if (snap.data()?.creatorId !== userId) throw forbidden();

    const body = await c.req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw badRequest('No updatable fields provided');
    }

    updates.updatedAt = new Date().toISOString();
    await ref.update(updates);

    const updated = await ref.get();
    return c.json({ id: updated.id, ...updated.data() });
  } catch (e) {
    return err(c, e);
  }
});

// DELETE /:id — delete gift
gifts.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    const ref = db.collection('celebrations').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw notFound('Gift not found');
    if (snap.data()?.creatorId !== userId) throw forbidden();

    await ref.delete();
    return c.json({ message: 'Gift deleted' });
  } catch (e) {
    return err(c, e);
  }
});

// POST /:id/publish
gifts.post('/:id/publish', idempotency, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    const ref = db.collection('celebrations').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw notFound('Gift not found');
    if (snap.data()?.creatorId !== userId) throw forbidden();

    const now = new Date().toISOString();
    const slug = snap.data()?.slug as string;

    await ref.update({ status: 'published', publishedAt: now, updatedAt: now });

    const shareUrl = `https://hersweetescape.com/g/${slug}`;
    return c.json({ shareUrl, publishedAt: now });
  } catch (e) {
    return err(c, e);
  }
});

// POST /:id/unpublish
gifts.post('/:id/unpublish', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    const ref = db.collection('celebrations').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw notFound('Gift not found');
    if (snap.data()?.creatorId !== userId) throw forbidden();

    const now = new Date().toISOString();
    await ref.update({ status: 'draft', updatedAt: now });

    return c.json({ status: 'draft', updatedAt: now });
  } catch (e) {
    return err(c, e);
  }
});

export default gifts;
