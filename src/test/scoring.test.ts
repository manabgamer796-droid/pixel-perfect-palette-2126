import { describe, expect, it } from "vitest";
import { normalizeUrl, scoreBand, vitalBand } from "@/lib/scoring";

describe("normalizeUrl", () => {
  it("adds https to bare domains", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
  });
  it("rejects non-domains and local hosts", () => {
    expect(normalizeUrl("not a url")).toBeNull();
    expect(normalizeUrl("localhost:3000")).toBeNull();
    expect(normalizeUrl("ftp://example.com")).toBeNull();
  });
});

describe("scoreBand", () => {
  it("uses Lighthouse bands", () => {
    expect(scoreBand(90)).toBe("good");
    expect(scoreBand(89)).toBe("average");
    expect(scoreBand(50)).toBe("average");
    expect(scoreBand(49)).toBe("poor");
    expect(scoreBand(null)).toBe("none");
  });
  it("uses LCP thresholds", () => {
    expect(vitalBand("lcp", 2500)).toBe("good");
    expect(vitalBand("lcp", 4001)).toBe("poor");
  });
});
