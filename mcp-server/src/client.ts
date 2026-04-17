const BASE_URL =
  process.env.GIFTFY_API_URL ??
  "https://us-central1-<your-firebase-project>.cloudfunctions.net/api/v1";

const API_KEY = process.env.GIFTFY_API_KEY ?? "";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText}: ${JSON.stringify(data)}`
    );
  }

  return data as T;
}

// ── Gifts ──────────────────────────────────────────────────────────────────

export function create(params: {
  recipientName: string;
  occasion?: string;
  vibe?: string;
  template?: string;
  tier?: string;
}) {
  return request("POST", "/gifts", params);
}

export function list() {
  return request("GET", "/gifts");
}

export function get(giftId: string) {
  return request("GET", `/gifts/${giftId}`);
}

export function update(
  giftId: string,
  fields: {
    recipientName?: string;
    occasion?: string;
    vibe?: string;
    template?: string;
    tier?: string;
  }
) {
  return request("PATCH", `/gifts/${giftId}`, fields);
}

export function del(giftId: string) {
  return request("DELETE", `/gifts/${giftId}`);
}

export function publish(giftId: string) {
  return request("POST", `/gifts/${giftId}/publish`);
}

export function unpublish(giftId: string) {
  return request("POST", `/gifts/${giftId}/unpublish`);
}

// ── Slides ─────────────────────────────────────────────────────────────────

export function addSlide(
  giftId: string,
  params: {
    slideType: string;
    content?: Record<string, unknown>;
    interactions?: Record<string, unknown>;
  }
) {
  return request("POST", `/gifts/${giftId}/slides`, params);
}

export function editSlide(
  giftId: string,
  slideId: string,
  params: {
    slideType?: string;
    content?: Record<string, unknown>;
    interactions?: Record<string, unknown>;
  }
) {
  return request("PATCH", `/gifts/${giftId}/slides/${slideId}`, params);
}

export function removeSlide(giftId: string, slideId: string) {
  return request("DELETE", `/gifts/${giftId}/slides/${slideId}`);
}

export function reorder(giftId: string, slideIds: string[]) {
  return request("PUT", `/gifts/${giftId}/slides/reorder`, { slideIds });
}

// ── Analytics ──────────────────────────────────────────────────────────────

export function insights(giftId: string) {
  return request("GET", `/gifts/${giftId}/insights`);
}

export function replies(giftId: string) {
  return request("GET", `/gifts/${giftId}/replies`);
}

// ── Uploads ────────────────────────────────────────────────────────────────

export function presignedUrl(params: {
  giftId: string;
  fileType: string;
  fileName?: string;
  fileSize?: number;
}) {
  return request("POST", "/uploads/presigned-url", params);
}
