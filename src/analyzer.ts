import type { Commit, DayStats } from "./git.js";

export interface RecapStats {
  totalCommits: number;
  totalInsertions: number;
  totalDeletions: number;
  totalFilesChanged: number;
  netLinesChanged: number;
  activeDays: number;
  avgCommitsPerDay: number;
  peakDay: DayStats | null;
  topAuthors: Array<{ author: string; commits: number }>;
  commitsByDay: Record<string, number>;
  mostActiveHour: number | null;
  longestStreak: number;
  commonPrefixes: Array<{ prefix: string; count: number }>;
}

const LANG_NAMES: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
  py: "Python", rb: "Ruby", go: "Go", rs: "Rust", java: "Java",
  kt: "Kotlin", c: "C", cpp: "C++", cs: "C#", php: "PHP",
  swift: "Swift", dart: "Dart", sql: "SQL", sh: "Bash",
  yaml: "YAML", yml: "YAML", toml: "TOML", json: "JSON", md: "Markdown",
  css: "CSS", scss: "SCSS", html: "HTML", vue: "Vue", svelte: "Svelte",
  tf: "Terraform",
};

export function mapLanguages(raw: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [ext, lines] of Object.entries(raw)) {
    const lang = LANG_NAMES[ext] ?? ext.toUpperCase();
    result[lang] = (result[lang] ?? 0) + lines;
  }
  return result;
}

export function analyzeCommits(commits: Commit[], dayStats: DayStats[]): RecapStats {
  const totalCommits = commits.length;
  const totalInsertions = commits.reduce((s, c) => s + c.insertions, 0);
  const totalDeletions = commits.reduce((s, c) => s + c.deletions, 0);
  const totalFilesChanged = commits.reduce((s, c) => s + c.filesChanged, 0);
  const activeDays = dayStats.length;
  const avgCommitsPerDay = activeDays > 0 ? totalCommits / activeDays : 0;
  const peakDay = dayStats.sort((a, b) => b.commits - a.commits)[0] ?? null;

  const authorMap: Record<string, number> = {};
  const commitsByDay: Record<string, number> = {};
  for (const c of commits) {
    authorMap[c.author] = (authorMap[c.author] ?? 0) + 1;
    const dow = new Date(c.date).toLocaleDateString("en-US", { weekday: "long" });
    commitsByDay[dow] = (commitsByDay[dow] ?? 0) + 1;
  }

  const topAuthors = Object.entries(authorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([author, c]) => ({ author, commits: c }));

  const prefixMap: Record<string, number> = {};
  for (const c of commits) {
    const match = c.message.match(/^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)/i);
    if (match) prefixMap[match[1]!.toLowerCase()] = (prefixMap[match[1]!.toLowerCase()] ?? 0) + 1;
  }
  const commonPrefixes = Object.entries(prefixMap).sort((a, b) => b[1] - a[1]).map(([prefix, count]) => ({ prefix, count }));

  // streak calculation
  const dateSorted = dayStats.map(d => d.date).sort();
  let longest = 0, current = 0;
  for (let i = 0; i < dateSorted.length; i++) {
    if (i === 0) { current = 1; continue; }
    const prev = new Date(dateSorted[i - 1]!);
    const curr = new Date(dateSorted[i]!);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff <= 1.5) current++;
    else current = 1;
    if (current > longest) longest = current;
  }

  return {
    totalCommits, totalInsertions, totalDeletions,
    totalFilesChanged, netLinesChanged: totalInsertions - totalDeletions,
    activeDays, avgCommitsPerDay, peakDay, topAuthors,
    commitsByDay, mostActiveHour: null, longestStreak: longest, commonPrefixes,
  };
}

export function getHighlightCommits(commits: Commit[], n = 5): Commit[] {
  return [...commits]
    .sort((a, b) => (b.insertions + b.deletions) - (a.insertions + a.deletions))
    .slice(0, n);
}

export function getCurrentStreak(dayStats: DayStats[]): number {
  if (dayStats.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0]!;
  const sorted = dayStats.map(d => d.date).sort().reverse();
  let streak = 0;
  let expected = today;
  for (const date of sorted) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0]!;
    } else break;
  }
  return streak;
}
// Extended language aliases for common shorthands
export const EXTRA_ALIASES: Record<string, string> = {
  "mjs":"JavaScript","cjs":"JavaScript","mts":"TypeScript","cts":"TypeScript",
  "jsx":"JavaScript","tsx":"TypeScript","rb":"Ruby","ex":"Elixir","exs":"Elixir",
  "hs":"Haskell","clj":"Clojure","fs":"F#","ml":"OCaml","nim":"Nim","zig":"Zig",
};

export function getCurrentStreak(dayStats: DayStats[]): number {
  if (dayStats.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0]!;
  const sorted = dayStats.map(d => d.date).sort().reverse();
  let streak = 0;
  let expected = today;
  for (const date of sorted) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0]!;
    } else break;
  }
  return streak;
}
// Extended language aliases for common shorthands
export const EXTRA_ALIASES: Record<string, string> = {
  "mjs":"JavaScript","cjs":"JavaScript","mts":"TypeScript","cts":"TypeScript",
  "jsx":"JavaScript","tsx":"TypeScript","rb":"Ruby","ex":"Elixir","exs":"Elixir",
  "hs":"Haskell","clj":"Clojure","fs":"F#","ml":"OCaml","nim":"Nim","zig":"Zig",
};
