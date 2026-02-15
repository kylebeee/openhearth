import { z } from "zod";

const PrivacyLayerSchema = z.union([
  z.literal("public"),
  z.literal("subgroup"),
  z.literal("private"),
  z.literal("agent-inferred"),
]);

const MemberRoleSchema = z.union([
  z.literal("owner"),
  z.literal("admin"),
  z.literal("member"),
  z.literal("guest"),
]);

const MemberChannelIdentitySchema = z
  .object({
    channel: z.string(),
    id: z.string(),
    username: z.string().optional(),
    displayName: z.string().optional(),
  })
  .strict();

const HearthMemberSchema = z
  .object({
    name: z.string(),
    role: MemberRoleSchema.optional(),
    timezone: z.string().optional(),
    preferredChannel: z.string().optional(),
    identities: z.array(MemberChannelIdentitySchema),
    preferences: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const HearthPrivacyDomainRuleSchema = z
  .object({
    domain: z.string(),
    layer: PrivacyLayerSchema,
  })
  .strict();

const HearthPrivacySchema = z
  .object({
    defaultLayer: PrivacyLayerSchema.optional(),
    domainRules: z.array(HearthPrivacyDomainRuleSchema).optional(),
  })
  .strict();

const HearthAutonomyLevelSchema = z.union([
  z.literal("passive"),
  z.literal("suggest"),
  z.literal("ask-first"),
  z.literal("autonomous"),
]);

const HearthAutonomyDomainSchema = z
  .object({
    domain: z.string(),
    level: HearthAutonomyLevelSchema,
  })
  .strict();

const HearthAutonomySchema = z
  .object({
    domains: z.array(HearthAutonomyDomainSchema).optional(),
  })
  .strict();

const HearthGroupSchema = z
  .object({
    name: z.string(),
    members: z.array(HearthMemberSchema).optional(),
    privacy: HearthPrivacySchema.optional(),
    autonomy: HearthAutonomySchema.optional(),
  })
  .strict();

export const HearthSchema = z
  .object({
    enabled: z.boolean().optional(),
    groups: z.record(z.string(), HearthGroupSchema).optional(),
  })
  .strict()
  .optional();
