import type { HiveGroupConfig } from "../../config/types.hive.js";
import type { HiveMember } from "../members/types.js";
import type { PrivacyLayer, PrivacyPolicy, ScopedContext } from "./types.js";

/**
 * Classify the privacy layer for a message based on chat type and config.
 */
export function classifyPrivacyLayer(params: {
  chatType?: string;
  groupConfig?: HiveGroupConfig;
  domain?: string;
}): PrivacyLayer {
  const { chatType, groupConfig, domain } = params;

  // Check domain-specific rules first
  if (domain && groupConfig?.privacy?.domainRules) {
    const rule = groupConfig.privacy.domainRules.find(
      (r) => r.domain.toLowerCase() === domain.toLowerCase(),
    );
    if (rule) {
      return rule.layer;
    }
  }

  // DM = private by default
  if (chatType === "direct") {
    return "private";
  }

  // Group/channel = use configured default or "public"
  if (chatType === "group" || chatType === "channel") {
    return groupConfig?.privacy?.defaultLayer ?? "public";
  }

  // Default for unknown chat types
  return groupConfig?.privacy?.defaultLayer ?? "public";
}

/**
 * Build a PrivacyPolicy from group config.
 */
export function buildPrivacyPolicy(groupConfig?: HiveGroupConfig): PrivacyPolicy {
  return {
    defaultLayer: groupConfig?.privacy?.defaultLayer ?? "public",
    domainRules: groupConfig?.privacy?.domainRules ?? [],
  };
}

/**
 * Filter scoped context entries for a specific member based on privacy rules.
 * A member can see:
 * - All "public" context
 * - "subgroup" context if they are in the subgroup
 * - "private" context only if they are the source member
 * - "agent-inferred" context is always available (no attribution)
 */
export function filterContextForMember(params: {
  contexts: ScopedContext[];
  memberId: string;
  memberSubgroupIds: string[];
}): ScopedContext[] {
  const { contexts, memberId, memberSubgroupIds } = params;
  const subgroupSet = new Set(memberSubgroupIds);

  return contexts.filter((ctx) => {
    switch (ctx.privacyLayer) {
      case "public":
        return true;
      case "agent-inferred":
        return true;
      case "subgroup":
        return ctx.subgroupId ? subgroupSet.has(ctx.subgroupId) : false;
      case "private":
        return ctx.sourceMemberId === memberId;
      default:
        return false;
    }
  });
}

/**
 * Check if a specific piece of context can be relayed to a target member.
 */
export function canRelayToMember(params: {
  context: ScopedContext;
  targetMemberId: string;
  targetSubgroupIds: string[];
}): boolean {
  const { context, targetMemberId, targetSubgroupIds } = params;

  switch (context.privacyLayer) {
    case "public":
      return true;
    case "agent-inferred":
      // Agent-inferred context can be used but never attributed
      return true;
    case "subgroup":
      return context.subgroupId ? targetSubgroupIds.includes(context.subgroupId) : false;
    case "private":
      return context.sourceMemberId === targetMemberId;
    default:
      return false;
  }
}

/**
 * Check if outbound text contains potential privacy violations.
 * Returns an array of violation descriptions (empty if clean).
 *
 * This is a post-processing guardrail that scans for patterns like:
 * - Direct attribution of private info ("Kyle said...", "According to Kyle...")
 * - Revealing source of private context
 */
export function scanForPrivacyViolations(params: {
  text: string;
  privateContexts: ScopedContext[];
  members: HiveMember[];
}): string[] {
  const { text, privateContexts, members } = params;
  const violations: string[] = [];
  const textLower = text.toLowerCase();

  for (const ctx of privateContexts) {
    if (ctx.privacyLayer !== "private") {
      continue;
    }
    const sourceMember = members.find((m) => m.memberId === ctx.sourceMemberId);
    if (!sourceMember) {
      continue;
    }

    const nameLower = sourceMember.name.toLowerCase();
    // Check for direct attribution patterns
    const attributionPatterns = [
      `${nameLower} said`,
      `${nameLower} told`,
      `${nameLower} mentioned`,
      `according to ${nameLower}`,
      `${nameLower} shared`,
      `${nameLower}'s private`,
      `${nameLower} privately`,
    ];

    for (const pattern of attributionPatterns) {
      if (textLower.includes(pattern)) {
        violations.push(
          `Potential attribution of private context from ${sourceMember.name}: "${pattern}"`,
        );
      }
    }
  }

  return violations;
}
