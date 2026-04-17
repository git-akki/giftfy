export const TOOLS = [
  {
    name: "giftfy_create",
    description:
      "Create a new digital gift (Giftfy). Returns the gift object including its id and slug. Required: recipientName. Optional: occasion (e.g. birthday, anniversary, graduation), vibe (e.g. romantic, funny, heartfelt), template, tier.",
    inputSchema: {
      type: "object",
      properties: {
        recipientName: {
          type: "string",
          description: "The name of the person receiving the gift.",
        },
        occasion: {
          type: "string",
          description:
            "The occasion for the gift, e.g. birthday, anniversary, graduation, just-because.",
        },
        vibe: {
          type: "string",
          description:
            "The emotional tone of the gift, e.g. romantic, funny, heartfelt, playful.",
        },
        template: {
          type: "string",
          description: "The visual template ID to use for this gift.",
        },
        tier: {
          type: "string",
          description: "The tier level of the gift, e.g. free, premium.",
        },
      },
      required: ["recipientName"],
    },
  },
  {
    name: "giftfy_list",
    description:
      "List all gifts created by the authenticated user, ordered newest first. Returns up to 50 gifts with their id, recipientName, status, slug, and timestamps.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "giftfy_get",
    description:
      "Get a single gift by its id, including all its slides in sort order. Use this to inspect a gift before editing or sharing it.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift.",
        },
      },
      required: ["giftId"],
    },
  },
  {
    name: "giftfy_update",
    description:
      "Update metadata fields of an existing draft gift. Updatable fields: recipientName, occasion, vibe, template, tier. At least one field must be supplied.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift to update.",
        },
        recipientName: { type: "string" },
        occasion: { type: "string" },
        vibe: { type: "string" },
        template: { type: "string" },
        tier: { type: "string" },
      },
      required: ["giftId"],
    },
  },
  {
    name: "giftfy_delete",
    description:
      "Permanently delete a gift and all its slides. This action is irreversible. Use only when the user explicitly confirms deletion.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift to delete.",
        },
      },
      required: ["giftId"],
    },
  },
  {
    name: "giftfy_add_slide",
    description: `Add a new slide to a gift. The slide is appended after existing slides. Slide types and the content each expects:

- hero: { headline, subheadline?, backgroundUrl? } — Opening title card.
- traits: { traits: string[] } — A list of personality traits or things you love about the recipient.
- photo_wall: { photos: Array<{ url, caption? }> } — A collage of photos with optional captions.
- chat_replay: { messages: Array<{ sender, text, ts? }> } — Replays a chat conversation, typewriter style.
- letter: { body, signedBy? } — A heartfelt letter rendered in a nice font.
- voice_note: { audioUrl, transcriptText? } — Plays a recorded voice message; transcript optional.
- candle_blow: {} — Interactive birthday-candle animation the recipient blows out.
- gift_reveal: { giftName, giftDescription?, giftImageUrl? } — Reveals a physical or virtual gift.
- thank_you: { message?, ctaLabel?, ctaUrl? } — Closing slide with optional reply CTA.`,
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift.",
        },
        slideType: {
          type: "string",
          enum: [
            "hero",
            "traits",
            "photo_wall",
            "chat_replay",
            "letter",
            "voice_note",
            "candle_blow",
            "gift_reveal",
            "thank_you",
          ],
          description: "The type of slide to add.",
        },
        content: {
          type: "object",
          description:
            "Slide-specific content payload. See tool description for shape per slideType.",
          additionalProperties: true,
        },
        interactions: {
          type: "object",
          description:
            "Optional interaction configuration for the slide (e.g. reaction buttons).",
          additionalProperties: true,
        },
      },
      required: ["giftId", "slideType"],
    },
  },
  {
    name: "giftfy_edit_slide",
    description:
      "Update the content, interactions, or slideType of an existing slide. Only the fields you provide are changed.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift.",
        },
        slideId: {
          type: "string",
          description: "The Firestore document ID of the slide to edit.",
        },
        slideType: {
          type: "string",
          enum: [
            "hero",
            "traits",
            "photo_wall",
            "chat_replay",
            "letter",
            "voice_note",
            "candle_blow",
            "gift_reveal",
            "thank_you",
          ],
        },
        content: {
          type: "object",
          additionalProperties: true,
        },
        interactions: {
          type: "object",
          additionalProperties: true,
        },
      },
      required: ["giftId", "slideId"],
    },
  },
  {
    name: "giftfy_remove_slide",
    description:
      "Remove a slide from a gift by its slideId. The remaining slides keep their existing sort order.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift.",
        },
        slideId: {
          type: "string",
          description: "The Firestore document ID of the slide to remove.",
        },
      },
      required: ["giftId", "slideId"],
    },
  },
  {
    name: "giftfy_reorder",
    description:
      "Reorder all slides in a gift by providing the full ordered array of slide IDs. Every slide in the gift must be included; their sortOrder is reassigned to match the array index.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift.",
        },
        slideIds: {
          type: "array",
          items: { type: "string" },
          description:
            "All slide IDs in the desired display order, index 0 = first slide.",
        },
      },
      required: ["giftId", "slideIds"],
    },
  },
  {
    name: "giftfy_publish",
    description:
      "Publish a gift so the recipient can view it. Returns a shareUrl (e.g. https://hersweetescape.com/g/<slug>) and publishedAt timestamp. The gift status changes from 'draft' to 'published'.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift to publish.",
        },
      },
      required: ["giftId"],
    },
  },
  {
    name: "giftfy_unpublish",
    description:
      "Unpublish a previously-published gift, taking it offline and setting its status back to 'draft'. The shareUrl will stop working until the gift is published again.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift to unpublish.",
        },
      },
      required: ["giftId"],
    },
  },
  {
    name: "giftfy_insights",
    description:
      "Get analytics for a published gift: total view count, page views, unique viewers, first viewed timestamp, and average time spent per slide.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift.",
        },
      },
      required: ["giftId"],
    },
  },
  {
    name: "giftfy_replies",
    description:
      "Fetch thank-you replies left by the recipient on a gift's thank_you slide, ordered newest first.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The Firestore document ID of the gift.",
        },
      },
      required: ["giftId"],
    },
  },
  {
    name: "giftfy_upload_url",
    description:
      "Get a pre-signed Google Cloud Storage upload URL so the client can upload a file directly without routing through the API. Returns uploadUrl (PUT to this), publicUrl (permanent read URL after upload), storage path, and expiry seconds (900). Allowed file types: image/jpeg, image/png, image/webp, image/gif, audio/webm, audio/mp4, audio/mpeg. Max 10 MB.",
    inputSchema: {
      type: "object",
      properties: {
        giftId: {
          type: "string",
          description: "The gift this file will be attached to.",
        },
        fileType: {
          type: "string",
          enum: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "audio/webm",
            "audio/mp4",
            "audio/mpeg",
          ],
          description: "MIME type of the file being uploaded.",
        },
        fileName: {
          type: "string",
          description: "Original file name (optional, used to generate storage path).",
        },
        fileSize: {
          type: "number",
          description: "File size in bytes (optional, validated against 10 MB limit).",
        },
      },
      required: ["giftId", "fileType"],
    },
  },
] as const;
