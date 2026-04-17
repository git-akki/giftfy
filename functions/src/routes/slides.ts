import { Hono } from 'hono';
import { db } from '../lib/admin';
import { notFound, forbidden, badRequest, err } from '../lib/errors';
import { requireAuth, AuthEnv } from '../middleware/auth';

const VALID_SLIDE_TYPES = [
  'hero',
  'traits',
  'photo_wall',
  'chat_replay',
  'letter',
  'voice_note',
  'candle_blow',
  'gift_reveal',
  'thank_you',
] as const;

type SlideType = typeof VALID_SLIDE_TYPES[number];

async function assertGiftOwner(giftId: string, userId: string) {
  const snap = await db.collection('celebrations').doc(giftId).get();
  if (!snap.exists) throw notFound('Gift not found');
  if (snap.data()?.creatorId !== userId) throw forbidden();
  return snap;
}

const slides = new Hono<AuthEnv>();

slides.use('*', requireAuth);

// POST /:giftId/slides — add slide
slides.post('/:giftId/slides', async (c) => {
  try {
    const userId = c.get('userId');
    const { giftId } = c.req.param();

    await assertGiftOwner(giftId, userId);

    const body = await c.req.json().catch(() => ({}));
    const { slideType, content, interactions } = body as {
      slideType?: string;
      content?: Record<string, unknown>;
      interactions?: Record<string, unknown>;
    };

    if (!slideType || !VALID_SLIDE_TYPES.includes(slideType as SlideType)) {
      throw badRequest(
        `slideType must be one of: ${VALID_SLIDE_TYPES.join(', ')}`
      );
    }

    // Auto-increment sortOrder
    const existingSnap = await db
      .collection('celebrations')
      .doc(giftId)
      .collection('slides')
      .orderBy('sortOrder', 'desc')
      .limit(1)
      .get();

    const sortOrder = existingSnap.empty
      ? 0
      : (existingSnap.docs[0].data().sortOrder as number) + 1;

    const now = new Date().toISOString();
    const slide = {
      slideType,
      content: content ?? {},
      interactions: interactions ?? {},
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db
      .collection('celebrations')
      .doc(giftId)
      .collection('slides')
      .add(slide);

    return c.json({ id: ref.id, ...slide }, 201);
  } catch (e) {
    return err(c, e);
  }
});

// PATCH /:giftId/slides/:slideId — update slide
slides.patch('/:giftId/slides/:slideId', async (c) => {
  try {
    const userId = c.get('userId');
    const { giftId, slideId } = c.req.param();

    await assertGiftOwner(giftId, userId);

    const slideRef = db
      .collection('celebrations')
      .doc(giftId)
      .collection('slides')
      .doc(slideId);

    const slideSnap = await slideRef.get();
    if (!slideSnap.exists) throw notFound('Slide not found');

    const body = await c.req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    if ('content' in body) updates['content'] = body.content;
    if ('interactions' in body) updates['interactions'] = body.interactions;
    if ('slideType' in body) {
      if (!VALID_SLIDE_TYPES.includes(body.slideType as SlideType)) {
        throw badRequest(`slideType must be one of: ${VALID_SLIDE_TYPES.join(', ')}`);
      }
      updates['slideType'] = body.slideType;
    }

    if (Object.keys(updates).length === 0) {
      throw badRequest('No updatable fields provided');
    }

    updates.updatedAt = new Date().toISOString();
    await slideRef.update(updates);

    const updated = await slideRef.get();
    return c.json({ id: updated.id, ...updated.data() });
  } catch (e) {
    return err(c, e);
  }
});

// DELETE /:giftId/slides/:slideId — delete slide
slides.delete('/:giftId/slides/:slideId', async (c) => {
  try {
    const userId = c.get('userId');
    const { giftId, slideId } = c.req.param();

    await assertGiftOwner(giftId, userId);

    const slideRef = db
      .collection('celebrations')
      .doc(giftId)
      .collection('slides')
      .doc(slideId);

    const slideSnap = await slideRef.get();
    if (!slideSnap.exists) throw notFound('Slide not found');

    await slideRef.delete();
    return c.json({ message: 'Slide deleted' });
  } catch (e) {
    return err(c, e);
  }
});

// PUT /:giftId/slides/reorder — batch reorder
slides.put('/:giftId/slides/reorder', async (c) => {
  try {
    const userId = c.get('userId');
    const { giftId } = c.req.param();

    await assertGiftOwner(giftId, userId);

    const body = await c.req.json().catch(() => ({}));
    const { slideIds } = body as { slideIds?: string[] };

    if (!Array.isArray(slideIds) || slideIds.length === 0) {
      throw badRequest('slideIds array is required');
    }

    const batch = db.batch();
    const now = new Date().toISOString();

    slideIds.forEach((slideId, index) => {
      const ref = db
        .collection('celebrations')
        .doc(giftId)
        .collection('slides')
        .doc(slideId);
      batch.update(ref, { sortOrder: index, updatedAt: now });
    });

    await batch.commit();
    return c.json({ message: 'Slides reordered', order: slideIds });
  } catch (e) {
    return err(c, e);
  }
});

export default slides;
