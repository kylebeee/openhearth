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

const HiveMemberSchema = z
  .object({
    name: z.string(),
    role: MemberRoleSchema.optional(),
    timezone: z.string().optional(),
    preferredChannel: z.string().optional(),
    identities: z.array(MemberChannelIdentitySchema),
    preferences: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const HivePrivacyDomainRuleSchema = z
  .object({
    domain: z.string(),
    layer: PrivacyLayerSchema,
  })
  .strict();

const HivePrivacySchema = z
  .object({
    defaultLayer: PrivacyLayerSchema.optional(),
    domainRules: z.array(HivePrivacyDomainRuleSchema).optional(),
  })
  .strict();

const HiveAutonomyLevelSchema = z.union([
  z.literal("passive"),
  z.literal("suggest"),
  z.literal("ask-first"),
  z.literal("autonomous"),
]);

const HiveAutonomyDomainSchema = z
  .object({
    domain: z.string(),
    level: HiveAutonomyLevelSchema,
  })
  .strict();

const HiveAutonomySchema = z
  .object({
    domains: z.array(HiveAutonomyDomainSchema).optional(),
  })
  .strict();

const HiveGroupSchema = z
  .object({
    name: z.string(),
    members: z.array(HiveMemberSchema).optional(),
    privacy: HivePrivacySchema.optional(),
    autonomy: HiveAutonomySchema.optional(),
  })
  .strict();

export const HiveSchema = z
  .object({
    enabled: z.boolean().optional(),
    groups: z.record(z.string(), HiveGroupSchema).optional(),
  })
  .strict()
  .optional();
