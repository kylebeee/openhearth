import type { MsgContext } from "../../auto-reply/templating.js";
import type { HearthConfig } from "../../config/types.hearth.js";
import type { HearthMemberRegistry } from "./registry.js";
import type { HearthMember } from "./types.js";

export type HearthMemberResolution =
  | {
      member: HearthMember;
      groupKey: string;
    }
  | undefined;

/**
 * Resolve the sender of a message to a HearthMember.
 *
 * Resolution strategy:
 * 1. Try registry lookup by channel + sender id
 * 2. Try registry lookup by channel + sender username
 * 3. Try registry lookup by channel + sender E.164 phone
 * 4. Fall back to config-based matching if registry has no match
 */
export function resolveMember(params: {
  ctx: MsgContext;
  registry: HearthMemberRegistry;
  hiveConfig: HearthConfig;
}): HearthMemberResolution {
  const { ctx, registry, hiveConfig } = params;
  const channel = (ctx.Provider ?? ctx.OriginatingChannel ?? "").toString().toLowerCase();
  if (!channel) {
    return undefined;
  }

  // Try by sender id
  if (ctx.SenderId || ctx.From) {
    const senderId = ctx.SenderId ?? ctx.From ?? "";
    const member = registry.resolveByChannelIdentity(channel, senderId);
    if (member) {
      const groupKey = findGroupKeyForMember(hiveConfig, member);
      if (groupKey) {
        return { member, groupKey };
      }
    }
  }

  // Try by sender username
  if (ctx.SenderUsername) {
    const member = registry.resolveByChannelIdentity(channel, ctx.SenderUsername);
    if (member) {
      const groupKey = findGroupKeyForMember(hiveConfig, member);
      if (groupKey) {
        return { member, groupKey };
      }
    }
  }

  // Try by E.164 phone number (WhatsApp, Signal)
  if (ctx.SenderE164) {
    const member = registry.resolveByChannelIdentity(channel, ctx.SenderE164);
    if (member) {
      const groupKey = findGroupKeyForMember(hiveConfig, member);
      if (groupKey) {
        return { member, groupKey };
      }
    }
  }

  // Fall back to config matching
  return resolveFromConfig(ctx, hiveConfig, channel);
}

function findGroupKeyForMember(hiveConfig: HearthConfig, member: HearthMember): string | undefined {
  if (!hiveConfig.groups) {
    return undefined;
  }
  for (const [groupKey, groupConfig] of Object.entries(hiveConfig.groups)) {
    if (!groupConfig.members) {
      continue;
    }
    for (const memberCfg of groupConfig.members) {
      for (const identity of memberCfg.identities) {
        if (
          member.identities.some(
            (mi) =>
              mi.channel.toLowerCase() === identity.channel.toLowerCase() &&
              mi.id.toLowerCase() === identity.id.toLowerCase(),
          )
        ) {
          return groupKey;
        }
      }
    }
  }
  return undefined;
}

function resolveFromConfig(
  ctx: MsgContext,
  hiveConfig: HearthConfig,
  channel: string,
): HearthMemberResolution {
  if (!hiveConfig.groups) {
    return undefined;
  }
  const senderId = (ctx.SenderId ?? ctx.From ?? "").toLowerCase();
  const senderUsername = (ctx.SenderUsername ?? "").toLowerCase();
  const senderE164 = (ctx.SenderE164 ?? "").toLowerCase();

  for (const [groupKey, groupConfig] of Object.entries(hiveConfig.groups)) {
    if (!groupConfig.members) {
      continue;
    }
    for (const memberCfg of groupConfig.members) {
      for (const identity of memberCfg.identities) {
        if (identity.channel.toLowerCase() !== channel) {
          continue;
        }
        const identityId = identity.id.toLowerCase();
        if (
          (senderId && identityId === senderId) ||
          (senderUsername && identityId === senderUsername) ||
          (senderE164 && identityId === senderE164) ||
          (identity.username &&
            senderUsername &&
            identity.username.toLowerCase() === senderUsername)
        ) {
          return {
            member: {
              memberId: `config:${identity.channel}:${identity.id}`,
              name: memberCfg.name,
              role: memberCfg.role ?? "member",
              timezone: memberCfg.timezone,
              preferredChannel: memberCfg.preferredChannel,
              identities: memberCfg.identities,
              preferences: memberCfg.preferences,
            },
            groupKey,
          };
        }
      }
    }
  }
  return undefined;
}
