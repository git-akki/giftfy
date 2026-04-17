#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { TOOLS } from "./tools.js";
import * as client from "./client.js";

const server = new Server(
  { name: "@giftfy/mcp", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

// ── List Tools ────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// ── Call Tool ─────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;

  let result: unknown;

  switch (name) {
    case "giftfy_create":
      result = await client.create({
        recipientName: a.recipientName as string,
        occasion: a.occasion as string | undefined,
        vibe: a.vibe as string | undefined,
        template: a.template as string | undefined,
        tier: a.tier as string | undefined,
      });
      break;

    case "giftfy_list":
      result = await client.list();
      break;

    case "giftfy_get":
      result = await client.get(a.giftId as string);
      break;

    case "giftfy_update":
      result = await client.update(a.giftId as string, {
        recipientName: a.recipientName as string | undefined,
        occasion: a.occasion as string | undefined,
        vibe: a.vibe as string | undefined,
        template: a.template as string | undefined,
        tier: a.tier as string | undefined,
      });
      break;

    case "giftfy_delete":
      result = await client.del(a.giftId as string);
      break;

    case "giftfy_publish":
      result = await client.publish(a.giftId as string);
      break;

    case "giftfy_unpublish":
      result = await client.unpublish(a.giftId as string);
      break;

    case "giftfy_add_slide":
      result = await client.addSlide(a.giftId as string, {
        slideType: a.slideType as string,
        content: a.content as Record<string, unknown> | undefined,
        interactions: a.interactions as Record<string, unknown> | undefined,
      });
      break;

    case "giftfy_edit_slide":
      result = await client.editSlide(a.giftId as string, a.slideId as string, {
        slideType: a.slideType as string | undefined,
        content: a.content as Record<string, unknown> | undefined,
        interactions: a.interactions as Record<string, unknown> | undefined,
      });
      break;

    case "giftfy_remove_slide":
      result = await client.removeSlide(
        a.giftId as string,
        a.slideId as string
      );
      break;

    case "giftfy_reorder":
      result = await client.reorder(
        a.giftId as string,
        a.slideIds as string[]
      );
      break;

    case "giftfy_insights":
      result = await client.insights(a.giftId as string);
      break;

    case "giftfy_replies":
      result = await client.replies(a.giftId as string);
      break;

    case "giftfy_upload_url":
      result = await client.presignedUrl({
        giftId: a.giftId as string,
        fileType: a.fileType as string,
        fileName: a.fileName as string | undefined,
        fileSize: a.fileSize as number | undefined,
      });
      break;

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
});

// ── Start ─────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
