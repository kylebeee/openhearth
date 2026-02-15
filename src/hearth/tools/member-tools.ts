import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "../../agents/tools/common.js";
import type { HearthMemberRegistry } from "../members/registry.js";
import { jsonResult, readStringParam } from "../../agents/tools/common.js";

export function createHearthMemberListTool(params: {
  registry: HearthMemberRegistry;
}): AnyAgentTool {
  return {
    label: "Hearth Members",
    name: "hearth_members",
    description:
      "List all members in the Hearth group. Returns names, roles, timezones, and preferred channels.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _input): Promise<AgentToolResult<unknown>> {
      const members = params.registry.getAllMembers();
      const summary = members.map((m) => ({
        memberId: m.memberId,
        name: m.name,
        role: m.role,
        timezone: m.timezone,
        preferredChannel: m.preferredChannel,
        identityCount: m.identities.length,
      }));
      return jsonResult({
        memberCount: members.length,
        members: summary,
      });
    },
  };
}

export function createHearthMemberInfoTool(params: {
  registry: HearthMemberRegistry;
}): AnyAgentTool {
  return {
    label: "Hearth Member Info",
    name: "hearth_member_info",
    description:
      "Get detailed information about a specific Hearth member by name or member ID. Includes their identities, timezone, and preferences.",
    parameters: Type.Object({
      query: Type.String({ description: "Member name or member ID to look up" }),
    }),
    async execute(_toolCallId, input): Promise<AgentToolResult<unknown>> {
      const query = readStringParam(input as Record<string, unknown>, "query", { required: true });
      const queryLower = query.toLowerCase();

      // Try exact member id first
      let member = params.registry.getMember(query);

      // If not found, search by name
      if (!member) {
        const allMembers = params.registry.getAllMembers();
        member = allMembers.find((m) => m.name.toLowerCase() === queryLower);
        if (!member) {
          // Partial match
          member = allMembers.find((m) => m.name.toLowerCase().includes(queryLower));
        }
      }

      if (!member) {
        return jsonResult({ error: `No member found matching "${query}"` });
      }

      return jsonResult({
        memberId: member.memberId,
        name: member.name,
        role: member.role,
        timezone: member.timezone,
        preferredChannel: member.preferredChannel,
        identities: member.identities.map((i) => ({
          channel: i.channel,
          id: i.id,
          username: i.username,
          displayName: i.displayName,
        })),
        preferences: member.preferences,
      });
    },
  };
}
