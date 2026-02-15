import { describe, expect, test } from "vitest";
import {
  getFrontmatterString,
  normalizeStringList,
  parseFrontmatterBool,
  resolveOpenHearthManifestBlock,
} from "./frontmatter.js";

describe("shared/frontmatter", () => {
  test("normalizeStringList handles strings and arrays", () => {
    expect(normalizeStringList("a, b,,c")).toEqual(["a", "b", "c"]);
    expect(normalizeStringList([" a ", "", "b"])).toEqual(["a", "b"]);
    expect(normalizeStringList(null)).toEqual([]);
  });

  test("getFrontmatterString extracts strings only", () => {
    expect(getFrontmatterString({ a: "b" }, "a")).toBe("b");
    expect(getFrontmatterString({ a: 1 }, "a")).toBeUndefined();
  });

  test("parseFrontmatterBool respects fallback", () => {
    expect(parseFrontmatterBool("true", false)).toBe(true);
    expect(parseFrontmatterBool("false", true)).toBe(false);
    expect(parseFrontmatterBool(undefined, true)).toBe(true);
  });

  test("resolveOpenHearthManifestBlock parses JSON5 metadata and picks openhearth block", () => {
    const frontmatter = {
      metadata: "{ openhearth: { foo: 1, bar: 'baz' } }",
    };
    expect(resolveOpenHearthManifestBlock({ frontmatter })).toEqual({ foo: 1, bar: "baz" });
  });

  test("resolveOpenHearthManifestBlock returns undefined for invalid input", () => {
    expect(resolveOpenHearthManifestBlock({ frontmatter: {} })).toBeUndefined();
    expect(
      resolveOpenHearthManifestBlock({ frontmatter: { metadata: "not-json5" } }),
    ).toBeUndefined();
    expect(
      resolveOpenHearthManifestBlock({ frontmatter: { metadata: "{ nope: { a: 1 } }" } }),
    ).toBeUndefined();
  });
});
