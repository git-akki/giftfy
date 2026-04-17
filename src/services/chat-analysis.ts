import type { ChatAnalysis, VibeType } from '@/lib/types';

const MAX_URL_LENGTH = 7500;

export function buildPrompt(recipientName: string, occasion: string, chatText: string): string {
  return `You are helping create a ${occasion} gift experience. Analyze this chat and return ONLY a JSON object (no markdown, no explanation, no code blocks).

The gift is for: ${recipientName}

Return this exact JSON structure:
{
  "nickname": "the name/nickname used most for ${recipientName}",
  "vibe": "playful" or "romantic" or "warm",
  "traits": [
    {"emoji": "relevant emoji", "label": "short trait title (3-4 words)", "desc": "one funny/personal line"}
  ],
  "messages": [
    {"from": "sender name", "text": "the message", "time": "timestamp if visible"}
  ],
  "inside_jokes": ["recurring joke 1", "joke 2", "joke 3"],
  "stats": {
    "total_messages": approximate count,
    "emoji_count": approximate emoji count,
    "top_emojis": ["emoji1", "emoji2", "emoji3"]
  },
  "letter_draft": "A short heartfelt ${occasion} message (3-4 sentences) based on the chat tone"
}

Rules:
- traits: 5-6 unique, funny, personal traits. Not generic.
- messages: 6-8 sweetest or funniest messages from the chat.
- inside_jokes: 3-4 themes that repeat multiple times.
- letter_draft: Write as the sender to ${recipientName}. Match chat tone.
- Return ONLY valid JSON. Nothing else.

Chat:
${chatText}`;
}

export function openLLM(provider: 'gemini' | 'chatgpt', prompt: string): { method: 'url' | 'clipboard'; url: string } {
  const encoded = encodeURIComponent(prompt);

  if (encoded.length <= MAX_URL_LENGTH) {
    const url = provider === 'gemini'
      ? `https://gemini.google.com/app?q=${encoded}`
      : `https://chatgpt.com/?q=${encoded}`;
    window.open(url, '_blank');
    return { method: 'url', url };
  }

  // Fallback: copy prompt to clipboard, open blank LLM
  navigator.clipboard.writeText(prompt).catch(() => {});
  const url = provider === 'gemini'
    ? 'https://gemini.google.com/app'
    : 'https://chatgpt.com/';
  window.open(url, '_blank');
  return { method: 'clipboard', url };
}

export function parseAnalysisResult(raw: string): ChatAnalysis | null {
  let text = raw.trim();

  // Strip markdown code blocks
  text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

  // Find JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.traits && !parsed.messages) return null;

    return {
      nickname: parsed.nickname || '',
      vibe: (parsed.vibe as VibeType) || 'warm',
      traits: Array.isArray(parsed.traits) ? parsed.traits.slice(0, 6) : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(0, 10) : [],
      insideJokes: Array.isArray(parsed.inside_jokes) ? parsed.inside_jokes : [],
      stats: {
        total_messages: parsed.stats?.total_messages || 0,
        emoji_count: parsed.stats?.emoji_count || 0,
        top_emojis: parsed.stats?.top_emojis || [],
      },
      letterDraft: parsed.letter_draft || '',
    };
  } catch {
    return null;
  }
}

// Basic client-side fallback parser (no AI, regex-based)
export function localChatParser(chatText: string, recipientName: string): ChatAnalysis {
  const lines = chatText.split('\n').filter((l) => l.trim());

  // Detect WhatsApp format: [date, time] - Name: message
  const waRegex = /^\[?\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\]?\s*-?\s*([^:]+):\s*(.+)/;
  const messages: { from: string; text: string; time: string }[] = [];
  const emojiRegex = /[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}]/gu;
  let emojiCount = 0;
  const emojiMap: Record<string, number> = {};

  for (const line of lines) {
    const match = line.match(waRegex);
    if (match) {
      const from = match[1].trim();
      const text = match[2].trim();
      if (text && !text.includes('<Media omitted>') && !text.includes('deleted this message')) {
        messages.push({ from, text, time: '' });
        const emojis = text.match(emojiRegex) || [];
        emojiCount += emojis.length;
        emojis.forEach((e) => { emojiMap[e] = (emojiMap[e] || 0) + 1; });
      }
    }
  }

  // Find sweet messages (contain hearts, love, miss, etc.)
  const sweetKeywords = /❤️|💖|💗|💕|🥺|love|miss|special|best|proud|care|thanku|thankuuu|sorry|beautiful|pretty/i;
  const sweetMessages = messages.filter((m) => sweetKeywords.test(m.text)).slice(0, 8);

  // Top emojis
  const topEmojis = Object.entries(emojiMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji]) => emoji);

  return {
    nickname: recipientName,
    vibe: 'warm',
    traits: [],
    messages: sweetMessages.length > 0 ? sweetMessages : messages.slice(-8),
    insideJokes: [],
    stats: { total_messages: messages.length, emoji_count: emojiCount, top_emojis: topEmojis },
    letterDraft: '',
  };
}
