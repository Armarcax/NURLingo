/**
 * NUR Lingo — Semantic Validator Unit Tests
 */
import { describe, it, expect } from "vitest";
import { validateAnswer, exactMatch, patternRegistryMatch, scoreToGrade } from "./validator";

describe("exactMatch()", () => {
  it("matches identical strings", () => {
    const r = exactMatch("Ես գնում եմ տուն", "Ես գնում եմ տուն", "hy");
    expect(r).not.toBeNull();
    expect(r?.accepted).toBe(true);
    expect(r?.score).toBe(1.0);
  });

  it("matches after normalization (punctuation/case)", () => {
    const r = exactMatch("ԵՍ ԳՆՈՒՄ ԵՄ ՏՈՒՆ։", "Ես գնում եմ տուն", "hy");
    expect(r).not.toBeNull();
    expect(r?.accepted).toBe(true);
  });

  it("returns null for mismatched strings", () => {
    const r = exactMatch("Ես տուն եմ գնում", "Ես գնում եմ տուն", "hy");
    expect(r).toBeNull();
  });
});

describe("patternRegistryMatch()", () => {
  it("accepts all valid variants of 'I am going home'", async () => {
    const variants = [
      "Ես գնում եմ տուն",
      "Ես տուն եմ գնում",
      "Տուն եմ գնում",
      "Գնում եմ տուն",
    ];
    for (const v of variants) {
      const r = patternRegistryMatch(v, "I am going home", "en");
      expect(r?.accepted).toBe(true);
    }
  });

  it("returns null if no pattern found", () => {
    const r = patternRegistryMatch("something", "nonexistent english", "en");
    expect(r).toBeNull();
  });
});

describe("validateAnswer() — full pipeline", () => {
  it("accepts exact correct answer", async () => {
    const r = await validateAnswer({
      userAnswer: "Ես գնում եմ տուն",
      expectedAnswer: "Ես գնում եմ տուն",
      sourceSentence: "I am going home",
      sourceLanguage: "en",
      targetLanguage: "hy",
    });
    expect(r.accepted).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(0.95);
  });

  it("accepts word-order variant via pattern registry", async () => {
    const r = await validateAnswer({
      userAnswer: "Ես տուն եմ գնում",
      expectedAnswer: "Ես գնում եմ տուն",
      sourceSentence: "I am going home",
      sourceLanguage: "en",
      targetLanguage: "hy",
    });
    expect(r.accepted).toBe(true);
  });

  it("accepts dropped-subject form", async () => {
    const r = await validateAnswer({
      userAnswer: "Տուն եմ գնում",
      expectedAnswer: "Ես գնում եմ տուն",
      sourceSentence: "I am going home",
      sourceLanguage: "en",
      targetLanguage: "hy",
    });
    expect(r.accepted).toBe(true);
  });

  it("rejects completely wrong answer", async () => {
    const r = await validateAnswer({
      userAnswer: "Ես ուտում եմ հաց",
      expectedAnswer: "Ես գնում եմ տուն",
      sourceSentence: "I am going home",
      sourceLanguage: "en",
      targetLanguage: "hy",
    });
    expect(r.accepted).toBe(false);
    expect(r.corrections).toBeDefined();
  });

  it("rejects empty answer", async () => {
    const r = await validateAnswer({
      userAnswer: "   ",
      expectedAnswer: "Ես գնում եմ տուն",
      sourceSentence: "I am going home",
      sourceLanguage: "en",
      targetLanguage: "hy",
    });
    expect(r.accepted).toBe(false);
  });
});

describe("scoreToGrade()", () => {
  it("maps 1.0 → perfect", () => expect(scoreToGrade(1.0)).toBe("perfect"));
  it("maps 0.9 → excellent", () => expect(scoreToGrade(0.9)).toBe("excellent"));
  it("maps 0.78 → good", () => expect(scoreToGrade(0.78)).toBe("good"));
  it("maps 0.55 → partial", () => expect(scoreToGrade(0.55)).toBe("partial"));
  it("maps 0.2 → incorrect", () => expect(scoreToGrade(0.2)).toBe("incorrect"));
});
