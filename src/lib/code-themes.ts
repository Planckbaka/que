import type { ThemeRegistrationRaw } from "shiki";

// Dual Shiki themes for the two worlds (spec §4.2). paper = ink type on paper,
// ink = paper type on ink. Every color is a token value or an ink/paper alpha
// — the audit test in code-themes.test.ts enforces the whitelist.
const INK = "#17120c";
const PAPER = "#f3eee3";
const RED = "#c8281e";
const RED_BRIGHT = "#e03a24";

export const paperTheme: ThemeRegistrationRaw = {
  name: "magpie-paper",
  type: "light",
  colors: {
    "editor.background": "transparent",
    "editor.foreground": INK,
  },
  settings: [
    { settings: { foreground: INK } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: `${INK}59`, fontStyle: "italic" },
    },
    {
      scope: ["keyword", "keyword.operator.new", "storage.type", "storage.modifier"],
      settings: { foreground: RED },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: `${INK}b3` },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character.escape"],
      settings: { foreground: RED_BRIGHT },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { fontStyle: "bold" },
    },
    { scope: ["punctuation"], settings: { foreground: `${INK}99` } },
    { scope: ["entity.name.tag"], settings: { foreground: RED } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: `${INK}b3` } },
    { scope: ["variable.language"], settings: { foreground: RED_BRIGHT } },
  ],
};

export const inkTheme: ThemeRegistrationRaw = {
  name: "magpie-ink",
  type: "dark",
  colors: {
    "editor.background": "transparent",
    "editor.foreground": PAPER,
  },
  settings: [
    { settings: { foreground: PAPER } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: `${PAPER}59`, fontStyle: "italic" },
    },
    {
      scope: ["keyword", "keyword.operator.new", "storage.type", "storage.modifier"],
      settings: { foreground: RED_BRIGHT },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: `${PAPER}b3` },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character.escape"],
      settings: { foreground: RED_BRIGHT },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { fontStyle: "bold" },
    },
    { scope: ["punctuation"], settings: { foreground: `${PAPER}99` } },
    { scope: ["entity.name.tag"], settings: { foreground: RED_BRIGHT } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: `${PAPER}b3` } },
    { scope: ["variable.language"], settings: { foreground: RED_BRIGHT } },
  ],
};
