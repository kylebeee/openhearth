import type {
  MemberRole,
  MemberChannelIdentity,
  HearthMemberPreferences,
} from "../hearth/members/types.js";
import type { PrivacyLayer } from "../hearth/privacy/types.js";

export type HearthMemberConfig = {
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
  preferences?: HearthMemberPreferences;
};

export type HearthPrivacyDomainRuleConfig = {
  /** Domain label (e.g. "finances", "health"). */
  domain: string;
  /** Privacy layer to apply. */
  layer: PrivacyLayer;
};

export type HearthPrivacyConfig = {
  /** Default privacy layer for group context. */
  defaultLayer?: PrivacyLayer;
  /** Domain-specific privacy overrides. */
  domainRules?: HearthPrivacyDomainRuleConfig[];
};

export type HearthAutonomyLevel = "passive" | "suggest" | "ask-first" | "autonomous";

export type HearthAutonomyDomainConfig = {
  /** Domain label (e.g. "scheduling", "spending"). */
  domain: string;
  /** Autonomy level for this domain. */
  level: HearthAutonomyLevel;
};

export type HearthAutonomyConfig = {
  /** Per-domain autonomy settings. */
  domains?: HearthAutonomyDomainConfig[];
};

export type HearthGroupConfig = {
  /** Human-readable group name. */
  name: string;
  /** Group members. */
  members?: HearthMemberConfig[];
  /** Privacy settings. */
  privacy?: HearthPrivacyConfig;
  /** Autonomy settings. */
  autonomy?: HearthAutonomyConfig;
};

export type HearthConfig = {
  /** Enable Hearth multi-party features. When false/absent, system behaves like stock OpenHearth. */
  enabled?: boolean;
  /** Group configurations keyed by group identifier (e.g. "whatsapp:group:123456@g.us"). */
  groups?: Record<string, HearthGroupConfig>;
};
