export type MemberRole = "owner" | "admin" | "member" | "guest";

export type MemberChannelIdentity = {
  /** Channel provider id (e.g. "whatsapp", "discord", "telegram"). */
  channel: string;
  /** Channel-specific user id (e.g. phone number, discord user id). */
  id: string;
  /** Optional username on the channel. */
  username?: string;
  /** Optional display name on the channel. */
  displayName?: string;
};

export type HearthMemberPreferences = {
  /** Preferred language for messages. */
  language?: string;
  /** Custom preferences (free-form). */
  [key: string]: unknown;
};

export type HearthMember = {
  /** Stable unique member id (UUID). */
  memberId: string;
  /** Display name. */
  name: string;
  /** Role within the group. */
  role: MemberRole;
  /** IANA timezone (e.g. "America/Chicago"). */
  timezone?: string;
  /** Preferred channel for DMs. */
  preferredChannel?: string;
  /** Cross-channel identities for this member. */
  identities: MemberChannelIdentity[];
  /** Member-level preferences. */
  preferences?: HearthMemberPreferences;
};

export type HearthSubgroup = {
  /** Stable unique subgroup id (UUID). */
  subgroupId: string;
  /** Human-readable subgroup name. */
  name: string;
  /** Member IDs in this subgroup. */
  memberIds: string[];
  /** When this subgroup was created (epoch ms). */
  createdAt: number;
};

export type HearthGroup = {
  /** Group key from config (e.g. "whatsapp:group:123456@g.us"). */
  groupKey: string;
  /** Human-readable group name. */
  name: string;
  /** Group members. */
  members: HearthMember[];
  /** Dynamic subgroups. */
  subgroups: HearthSubgroup[];
};
