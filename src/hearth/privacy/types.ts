/**
 * Privacy layers control how context is scoped and shared.
 * - public: Visible to all group members (default for group chat).
 * - subgroup: Visible only to members of a specific subgroup.
 * - private: Visible only to the originating member and the agent (default for DMs).
 * - agent-inferred: Synthesized by the agent from private context; may be used
 *   in aggregate without attribution.
 */
export type PrivacyLayer = "public" | "subgroup" | "private" | "agent-inferred";

export type PrivacyDomainRule = {
  /** Domain label (e.g. "finances", "health", "relationships"). */
  domain: string;
  /** Privacy layer to apply for this domain. */
  layer: PrivacyLayer;
};

export type PrivacyPolicy = {
  /** Default privacy layer for this group context. */
  defaultLayer: PrivacyLayer;
  /** Domain-specific overrides. */
  domainRules: PrivacyDomainRule[];
};

export type ScopedContext = {
  /** Unique context id. */
  contextId: string;
  /** Source member id (who said/provided this). */
  sourceMemberId: string;
  /** Group key this context belongs to. */
  groupKey: string;
  /** Subgroup id if scoped to a subgroup. */
  subgroupId?: string;
  /** Privacy layer for this context. */
  privacyLayer: PrivacyLayer;
  /** The context content. */
  content: string;
  /** Optional domain tag (e.g. "health", "finances"). */
  domain?: string;
  /** When this context was recorded (epoch ms). */
  createdAt: number;
  /** Session key where this context originated. */
  sourceSessionKey?: string;
};
