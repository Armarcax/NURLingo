/**
 * NUR Lingo — NLP Morphology Unit Tests
 * Validates Armenian tokenization, lemmatization, and morphological equivalence.
 */
import { describe, it, expect } from "vitest";
import {
  tokenizeArmenian,
  normalizeArmenian,
  lemmatize,
  areMorphologicallyEquivalent,
  isArmenian,
} from "./morphology";

describe("isArmenian()", () => {
  it("detects Armenian Unicode", () => {
    expect(isArmenian("ես")).toBe(true);
    expect(isArmenian("hello")).toBe(false);
    expect(isArmenian("Ա")).toBe(true);
  });
});

describe("normalizeArmenian()", () => {
  it("strips Armenian punctuation", () => {
    expect(normalizeArmenian("Ես գնում եմ։")).toBe("ես գնում եմ");
  });
  it("lowercases", () => {
    expect(normalizeArmenian("ԵՍ ԳՆՈՒՄ ԵՄ")).toBe("ես գնում եմ");
  });
  it("collapses whitespace", () => {
    expect(normalizeArmenian("ես   գնում   եմ")).toBe("ես գնում եմ");
  });
});

describe("tokenizeArmenian()", () => {
  it("splits Armenian sentence into tokens", () => {
    const tokens = tokenizeArmenian("Ես գնում եմ տուն");
    expect(tokens).toEqual(["ես", "գնում", "եմ", "տուն"]);
  });
  it("strips punctuation", () => {
    const tokens = tokenizeArmenian("Բարև։ Ինչպե՞ս ես");
    expect(tokens).toContain("բարև");
  });
  it("handles empty string", () => {
    expect(tokenizeArmenian("")).toEqual([]);
  });
});

describe("lemmatize()", () => {
  it("identifies irregular verb: գնում եմ → գնալ", () => {
    const r = lemmatize("գնում եմ");
    expect(r.lemma).toBe("գնալ");
    expect(r.confidence).toBe(1.0);
  });

  it("identifies irregular verb: գնացի → գնալ", () => {
    const r = lemmatize("գնացի");
    expect(r.lemma).toBe("գնալ");
  });

  it("identifies copula: եմ → լինել", () => {
    const r = lemmatize("եմ");
    expect(r.lemma).toBe("լինել");
    expect(r.features).toContain("copula");
  });

  it("identifies future form: կգնամ → գնալ", () => {
    const r = lemmatize("կգնամ");
    expect(r.lemma).toBe("գնալ");
  });

  it("handles unknown word with low confidence", () => {
    const r = lemmatize("անծանոթ");
    expect(r.confidence).toBeLessThan(0.5);
  });
});

describe("areMorphologicallyEquivalent()", () => {
  it("accepts same-meaning SOV vs SVO", () => {
    const result = areMorphologicallyEquivalent(
      "Ես գնում եմ տուն",
      "Ես տուն եմ գնում"
    );
    expect(result.equivalent).toBe(true);
    expect(result.overlap).toBeGreaterThan(0.7);
  });

  it("rejects completely different sentences", () => {
    const result = areMorphologicallyEquivalent(
      "Ես ուտում եմ հաց",
      "Նա կարդում է գիրք"
    );
    expect(result.equivalent).toBe(false);
  });

  it("accepts dropped subject", () => {
    const result = areMorphologicallyEquivalent(
      "Գնում եմ տուն",       // no subject
      "Ես գնում եմ տուն"
    );
    expect(result.equivalent).toBe(true);
  });
});
