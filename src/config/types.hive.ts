import type {
  MemberRole,
  MemberChannelIdentity,
  HiveMemberPreferences,
} from "../hive/members/types.js";
import type { PrivacyLayer } from "../hive/privacy/types.js";

export type HiveMemberConfig = {
  /** Display name. */
  name: string;
  /** Role within the group. */
  role?: MemberRole;
  /** IANA timezone (e.g. "America/Chicago"). */
  timezone?: string;
  /** Preferred channel for DMs. */
  preferredChannel?: string;
  /** Cross-channel identities for this member. */
  identities: MemberChannelIdentity[];
  /** Member-level preferences. */
  preferences?: HiveMemberPreferences;
};

export type HivePrivacyDomainRuleConfig = {
  /** Domain label (e.g. "finances", "health"). */
  domain: string;
  /** Privacy layer to apply. */
  layer: PrivacyLayer;
};

export type HivePrivacyConfig = {
  /** Default privacy layer for group context. */
  defaultLayer?: PrivacyLayer;
  /** Domain-specific privacy overrides. */
  domainRules?: HivePrivacyDomainRuleConfig[];
};

export type HiveAutonomyLevel = "passive" | "suggest" | "ask-first" | "autonomous";

export type HiveAutonomyDomainConfig = {
  /** Domain label (e.g. "scheduling", "spending"). */
  domain: string;
  /** Autonomy level for this domain. */
  level: HiveAutonomyLevel;
};

export type HiveAutonomyConfig = {
  /** Per-domain autonomy settings. */
  domains?: HiveAutonomyDomainConfig[];
};

export type HiveGroupConfig = {
  /** Human-readable group name. */
  name: string;
  /** Group members. */
  members?: HiveMemberConfig[];
  /** Privacy settings. */
  privacy?: HivePrivacyConfig;
  /** Autonomy settings. */
  autonomy?: HiveAutonomyConfig;
};

export type HiveConfig = {
  /** Enable Hive multi-party features. When false/absent, system behaves like stock OpenClaw. */
  enabled?: boolean;
  /** Group configurations keyed by group identifier (e.g. "whatsapp:group:123456@g.us"). */
  groups?: Record<string, HiveGroupConfig>;
};
