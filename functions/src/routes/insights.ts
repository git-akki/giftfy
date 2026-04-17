import { Hono } from 'hono';
import { db } from '../lib/admin';
import { notFound, forbidden, err } from '../lib/errors';
import { requireAuth, AuthEnv } from '../middleware/auth';

const insights = new Hono<AuthEnv>();

insights.use('*', requireAuth);

// GET /:id/insights — analytics for a gift
insights.get('/:id/insights', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    const giftRef = db.collection('celebrations').doc(id);
    const giftSnap = await giftRef.get();
    if (!giftSnap.exists) throw notFound('Gift not found');
    if (giftSnap.data()?.creatorId !== userId) throw forbidden();

    const giftData = giftSnap.data()!;

    // Fetch viewEvents subcollection
    const viewEventsSnap = await giftRef
      .collection('viewEvents')
      .orderBy('createdAt', 'asc')
      .get();

    const pageViews = viewEventsSnap.size;

    // Unique viewers by visitorId
    const visitorIds = new Set<string>();
    let firstViewedAt: string | null = null;
    const slideTimings: Record<string, number[]> = {};

    viewEventsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.visitorId) visitorIds.add(data.visitorId);
      if (!firstViewedAt && data.createdAt) firstViewedAt = data.createdAt;

      // Aggregate time per slide
      if (data.slideId && typeof data.duration === 'number') {
        if (!slideTimings[data.slideId]) slideTimings[data.slideId] = [];
        slideTimings[data.slideId].push(data.duration);
      }
    });

    // Compute average time per slide
    const timePerSlide: Record<string, number> = {};
    for (const [slideId, durations] of Object.entries(slideTimings)) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      timePerSlide[slideId] = Math.round(avg);
    }

    return c.json({
      viewCount: giftData.viewCount ?? 0,
      pageViews,
      uniqueViewers: visitorIds.size,
      firstViewedAt,
      timePerSlide,
    });
  } catch (e) {
    return err(c, e);
  }
});

// GET /:id/replies — thank-you replies
insights.get('/:id/replies', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    const giftRef = db.collection('celebrations').doc(id);
    const giftSnap = await giftRef.get();
    if (!giftSnap.exists) throw notFound('Gift not found');
    if (giftSnap.data()?.creatorId !== userId) throw forbidden();

    const repliesSnap = await giftRef
      .collection('replies')
      .orderBy('createdAt', 'desc')
      .get();

    const replies = repliesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return c.json({ replies });
  } catch (e) {
    return err(c, e);
  }
});

export default insights;
