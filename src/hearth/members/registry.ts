import type { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import fsSync from "node:fs";
import path from "node:path";
import type { HearthMember, HearthSubgroup, MemberChannelIdentity, MemberRole } from "./types.js";
import { createSubsystemLogger } from "../../logging/subsystem.js";
import { requireNodeSqlite } from "../../memory/sqlite.js";

const log = createSubsystemLogger("hearth");

function ensureHearthMemberSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      member_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      timezone TEXT,
      preferred_channel TEXT,
      preferences TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS member_identities (
      member_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      username TEXT,
      display_name TEXT,
      PRIMARY KEY (channel, channel_id),
      FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_identities_member ON member_identities(member_id);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS subgroups (
      subgroup_id TEXT PRIMARY KEY,
      group_key TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS subgroup_members (
      subgroup_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      PRIMARY KEY (subgroup_id, member_id),
      FOREIGN KEY (subgroup_id) REFERENCES subgroups(subgroup_id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
    );
  `);
}

export class HearthMemberRegistry {
  private db: DatabaseSync;
  private readonly dbPath: string;

  constructor(stateDir: string) {
    const hiveDir = path.join(stateDir, "hearth");
    if (!fsSync.existsSync(hiveDir)) {
      fsSync.mkdirSync(hiveDir, { recursive: true });
    }
    this.dbPath = path.join(hiveDir, "members.db");
    const { DatabaseSync } = requireNodeSqlite();
    this.db = new DatabaseSync(this.dbPath);
    ensureHearthMemberSchema(this.db);
    log.info(`Hearth member registry initialized at ${this.dbPath}`);
  }

  upsertMember(member: HearthMember): void {
    const now = Date.now();
    const existing = this.db
      .prepare("SELECT member_id FROM members WHERE member_id = ?")
      .get(member.memberId) as { member_id: string } | undefined;

    if (existing) {
      this.db
        .prepare(
          "UPDATE members SET name = ?, role = ?, timezone = ?, preferred_channel = ?, preferences = ?, updated_at = ? WHERE member_id = ?",
        )
        .run(
          member.name,
          member.role,
          member.timezone ?? null,
          member.preferredChannel ?? null,
          member.preferences ? JSON.stringify(member.preferences) : null,
          now,
          member.memberId,
        );
    } else {
      this.db
        .prepare(
          "INSERT INTO members (member_id, name, role, timezone, preferred_channel, preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .run(
          member.memberId,
          member.name,
          member.role,
          member.timezone ?? null,
          member.preferredChannel ?? null,
          member.preferences ? JSON.stringify(member.preferences) : null,
          now,
          now,
        );
    }

    // Replace identities
    this.db.prepare("DELETE FROM member_identities WHERE member_id = ?").run(member.memberId);
    const insertIdentity = this.db.prepare(
      "INSERT OR REPLACE INTO member_identities (member_id, channel, channel_id, username, display_name) VALUES (?, ?, ?, ?, ?)",
    );
    for (const identity of member.identities) {
      insertIdentity.run(
        member.memberId,
        identity.channel,
        identity.id,
        identity.username ?? null,
        identity.displayName ?? null,
      );
    }
  }

  getMember(memberId: string): HearthMember | undefined {
    const row = this.db.prepare("SELECT * FROM members WHERE member_id = ?").get(memberId) as
      | {
          member_id: string;
          name: string;
          role: string;
          timezone: string | null;
          preferred_channel: string | null;
          preferences: string | null;
        }
      | undefined;
    if (!row) {
      return undefined;
    }
    const identities = this.getIdentities(row.member_id);
    return {
      memberId: row.member_id,
      name: row.name,
      role: row.role as MemberRole,
      timezone: row.timezone ?? undefined,
      preferredChannel: row.preferred_channel ?? undefined,
      identities,
      preferences: row.preferences ? JSON.parse(row.preferences) : undefined,
    };
  }

  getAllMembers(): HearthMember[] {
    const rows = this.db.prepare("SELECT * FROM members ORDER BY name").all() as Array<{
      member_id: string;
      name: string;
      role: string;
      timezone: string | null;
      preferred_channel: string | null;
      preferences: string | null;
    }>;
    return rows.map((row) => ({
      memberId: row.member_id,
      name: row.name,
      role: row.role as MemberRole,
      timezone: row.timezone ?? undefined,
      preferredChannel: row.preferred_channel ?? undefined,
      identities: this.getIdentities(row.member_id),
      preferences: row.preferences ? JSON.parse(row.preferences) : undefined,
    }));
  }

  /**
   * Resolve a member by channel identity (channel + id).
   * Returns undefined if no match found.
   */
  resolveByChannelIdentity(channel: string, channelId: string): HearthMember | undefined {
    const row = this.db
      .prepare("SELECT member_id FROM member_identities WHERE channel = ? AND channel_id = ?")
      .get(channel.toLowerCase(), channelId.toLowerCase()) as { member_id: string } | undefined;
    if (!row) {
      return undefined;
    }
    return this.getMember(row.member_id);
  }

  removeMember(memberId: string): void {
    this.db.prepare("DELETE FROM member_identities WHERE member_id = ?").run(memberId);
    this.db.prepare("DELETE FROM subgroup_members WHERE member_id = ?").run(memberId);
    this.db.prepare("DELETE FROM members WHERE member_id = ?").run(memberId);
  }

  // -- Subgroup operations --

  createSubgroup(groupKey: string, name: string, memberIds: string[]): HearthSubgroup {
    const subgroupId = randomUUID();
    const now = Date.now();
    this.db
      .prepare(
        "INSERT INTO subgroups (subgroup_id, group_key, name, created_at) VALUES (?, ?, ?, ?)",
      )
      .run(subgroupId, groupKey, name, now);
    const insertMember = this.db.prepare(
      "INSERT OR IGNORE INTO subgroup_members (subgroup_id, member_id) VALUES (?, ?)",
    );
    for (const memberId of memberIds) {
      insertMember.run(subgroupId, memberId);
    }
    return { subgroupId, name, memberIds, createdAt: now };
  }

  getSubgroups(groupKey: string): HearthSubgroup[] {
    const rows = this.db
      .prepare("SELECT * FROM subgroups WHERE group_key = ? ORDER BY created_at")
      .all(groupKey) as Array<{
      subgroup_id: string;
      group_key: string;
      name: string;
      created_at: number;
    }>;
    return rows.map((row) => {
      const memberRows = this.db
        .prepare("SELECT member_id FROM subgroup_members WHERE subgroup_id = ?")
        .all(row.subgroup_id) as Array<{ member_id: string }>;
      return {
        subgroupId: row.subgroup_id,
        name: row.name,
        memberIds: memberRows.map((m) => m.member_id),
        createdAt: row.created_at,
      };
    });
  }

  dissolveSubgroup(subgroupId: string): void {
    this.db.prepare("DELETE FROM subgroup_members WHERE subgroup_id = ?").run(subgroupId);
    this.db.prepare("DELETE FROM subgroups WHERE subgroup_id = ?").run(subgroupId);
  }

  close(): void {
    this.db.close();
  }

  private getIdentities(memberId: string): MemberChannelIdentity[] {
    const rows = this.db
      .prepare("SELECT * FROM member_identities WHERE member_id = ?")
      .all(memberId) as Array<{
      channel: string;
      channel_id: string;
      username: string | null;
      display_name: string | null;
    }>;
    return rows.map((row) => ({
      channel: row.channel,
      id: row.channel_id,
      username: row.username ?? undefined,
      displayName: row.display_name ?? undefined,
    }));
  }
}

/**
 * Sync Hearth members from config into the registry.
 * Upserts all members defined in config, generating stable UUIDs
 * based on name + first identity for idempotent syncing.
 */
export function syncMembersFromConfig(
  registry: HearthMemberRegistry,
  groups: Record<
    string,
    {
      members?: Array<{
        name: string;
        role?: MemberRole;
        timezone?: string;
        preferredChannel?: string;
        identities: MemberChannelIdentity[];
        preferences?: Record<string, unknown>;
      }>;
    }
  >,
): void {
  for (const [_groupKey, groupConfig] of Object.entries(groups)) {
    if (!groupConfig.members) {
      continue;
    }
    for (const memberCfg of groupConfig.members) {
      // Derive a deterministic id from the first identity so config reloads are idempotent
      const primaryIdentity = memberCfg.identities[0];
      const _stableKey = primaryIdentity
        ? `${primaryIdentity.channel}:${primaryIdentity.id}`
        : memberCfg.name;

      // Check if member already exists by primary identity
      let existing: HearthMember | undefined;
      if (primaryIdentity) {
        existing = registry.resolveByChannelIdentity(primaryIdentity.channel, primaryIdentity.id);
      }

      const memberId = existing?.memberId ?? randomUUID();
      registry.upsertMember({
        memberId,
        name: memberCfg.name,
        role: memberCfg.role ?? "member",
        timezone: memberCfg.timezone,
        preferredChannel: memberCfg.preferredChannel,
        identities: memberCfg.identities,
        preferences: memberCfg.preferences,
      });
    }
  }
}
