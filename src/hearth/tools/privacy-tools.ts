import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "../../agents/tools/common.js";
import type { HearthConfig } from "../../config/types.hearth.js";
import { jsonResult, readStringParam } from "../../agents/tools/common.js";
import { classifyPrivacyLayer } from "../privacy/engine.js";

export function createHearthContextCheckTool(params: { hiveConfig: HearthConfig }): AnyAgentTool {
  return {
    label: "Hearth Context Check",
    name: "hearth_context_check",
    description:
      "Check the privacy boundary for a piece of information before sharing it. " +
      "Returns whether the information can be shared in the current context and any restrictions.",
    parameters: Type.Object({
      content: Type.String({ description: "The content to check privacy for" }),
      domain: Type.Optional(
        Type.String({
          description:
            'Optional domain tag (e.g. "health", "finances", "personal") for domain-specific rules',
        }),
      ),
      chatType: Type.Optional(
        Type.String({
          description: 'Current chat type: "direct", "group", or "channel"',
        }),
      ),
      groupKey: Type.Optional(Type.String({ description: "Group key to check privacy against" })),
    }),
    async execute(_toolCallId, input): Promise<AgentToolResult<unknown>> {
      const inputRecord = input as Record<string, unknown>;
      const domain = readStringParam(inputRecord, "domain");
      const chatType = readStringParam(inputRecord, "chatType") ?? "group";
      const groupKey = readStringParam(inputRecord, "groupKey");

      const groupConfig = groupKey ? params.hiveConfig.groups?.[groupKey] : undefined;

      const layer = classifyPrivacyLayer({
        chatType,
        groupConfig,
        domain,
      });

      const canShare = layer === "public" || layer === "agent-inferred";
      const guidance =
        layer === "private"
          ? "This information is private. Do not share or attribute to any member. You may use it to inform your decisions without revealing the source."
          : layer === "subgroup"
            ? "This information is scoped to a subgroup. Only share with members of the relevant subgroup."
            : layer === "agent-inferred"
              ? "This information is agent-inferred. You may use it in aggregate without attribution."
              : "This information is public and can be freely shared.";

      return jsonResult({
        privacyLayer: layer,
        canShareInGroup: canShare,
        guidance,
        domain: domain ?? null,
      });
    },
  };
}

export function createHearthContextNoteTool(): AnyAgentTool {
  return {
    label: "Hearth Context Note",
    name: "hearth_context_note",
    description:
      "Store a scoped context note about a member. " +
      "Notes are privacy-tagged and can only be surfaced according to their privacy layer. " +
      "Use this to remember member preferences, constraints, or information shared in DMs.",
    parameters: Type.Object({
      content: Type.String({ description: "The note content to store" }),
      memberId: Type.String({ description: "The member this note is about" }),
      privacyLayer: Type.Optional(
        Type.String({
          description:
            'Privacy layer: "public", "private", "subgroup", or "agent-inferred". Defaults to "private".',
        }),
      ),
      domain: Type.Optional(
        Type.String({
          description: 'Optional domain tag (e.g. "health", "dietary", "schedule", "finances")',
        }),
      ),
    }),
    async execute(_toolCallId, input): Promise<AgentToolResult<unknown>> {
      const inputRecord = input as Record<string, unknown>;
      const _content = readStringParam(inputRecord, "content", { required: true });
      const memberId = readStringParam(inputRecord, "memberId", { required: true });
      const privacyLayer = readStringParam(inputRecord, "privacyLayer") ?? "private";
      const domain = readStringParam(inputRecord, "domain");

      // Note: In Phase 2 this will persist to the context store (SQLite).
      // For Phase 1, we acknowledge the note but rely on session memory.
      return jsonResult({
        stored: true,
        memberId,
        privacyLayer,
        domain: domain ?? null,
        note: `Context note stored for member ${memberId} (${privacyLayer}${domain ? `, domain: ${domain}` : ""})`,
        _phase1Note:
          "Context persistence will be backed by SQLite in Phase 2. " +
          "For now, this note exists within the current session context.",
      });
    },
  };
}
