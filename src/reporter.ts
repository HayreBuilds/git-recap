import type { RecapStats } from "./analyzer.js";
import type { Commit, DayStats } from "./git.js";

const R = "\x1b[0m", B = "\x1b[1m", DIM = "\x1b[2m";
const GR = "\x1b[32m", CY = "\x1b[36m", YE = "\x1b[33m", MA = "\x1b[35m", BL = "\x1b[34m";
const c = (col: string, t: string, tty = true) => tty && process.stdout.isTTY ? `${col}${t}${R}` : t;

const BAR_CHARS = "█▇▆▅▄▃▂▁";

function bar(n: number, max: number, width = 20): string {
  const filled = max === 0 ? 0 : Math.round((n / max) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function num(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function renderText(
  repoName: string,
  period: string,
  stats: RecapStats,
  langStats: Record<string, number>,
  highlights: Commit[],
  dayStats: DayStats[]
): string {
  const lines: string[] = [];
  const push = (...l: string[]) => lines.push(...l);

  push(
    "",
    `  ┌─────────────────────────────────────────────────────┐`,
    `  │             git-recap — ${repoName.padEnd(26)}│`,
    `  │             ${period.padEnd(40)}│`,
    `  └─────────────────────────────────────────────────────┘`,
    ""
  );

  push("  📊 SUMMARY", "  " + "─".repeat(54));
  push(`  Commits       ${stats.totalCommits}`);
  push(`  Files changed ${stats.totalFilesChanged}`);
  push(`  Lines added   +${num(stats.totalInsertions)}`);
  push(`  Lines removed -${num(stats.totalDeletions)}`);
  push(`  Net change    ${stats.netLinesChanged >= 0 ? "+" : ""}${num(stats.netLinesChanged)}`);
  push(`  Active days   ${stats.activeDays}`);
  push(`  Avg/day       ${stats.avgCommitsPerDay.toFixed(1)} commits`);
  if (stats.longestStreak > 1) push(`  Streak        ${stats.longestStreak} consecutive days`);
  push("");

  if (Object.keys(langStats).length > 0) {
    push("  🌐 LANGUAGES", "  " + "─".repeat(54));
    const total = Object.values(langStats).reduce((s, n) => s + n, 0);
    const top = Object.entries(langStats).sort((a, b) => b[1] - a[1]).slice(0, 7);
    for (const [lang, lines] of top) {
      const pct = total > 0 ? (lines / total * 100).toFixed(1) : "0.0";
      const b = bar(lines, top[0]![1], 16);
      push(`  ${lang.padEnd(14)} ${b} ${pct}%`);
    }
    push("");
  }

  if (dayStats.length > 0) {
    push("  📅 ACTIVITY BY DAY", "  " + "─".repeat(54));
    const max = Math.max(...dayStats.map(d => d.commits));
    for (const d of dayStats.sort((a, b) => a.date.localeCompare(b.date))) {
      const b = bar(d.commits, max, 14);
      push(`  ${d.date}  ${b}  ${d.commits} commit${d.commits !== 1 ? "s" : ""}`);
    }
    push("");
  }

  if (stats.commitsByDay && Object.keys(stats.commitsByDay).length > 0) {
    const order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const sorted = order.filter(d => stats.commitsByDay[d]).map(d => [d, stats.commitsByDay[d]!] as [string, number]);
    if (sorted.length > 0) {
      push("  📆 COMMITS BY DAY OF WEEK", "  " + "─".repeat(54));
      const maxDow = Math.max(...sorted.map(([, n]) => n));
      for (const [day, count] of sorted) {
        push(`  ${day.padEnd(12)} ${bar(count, maxDow, 14)}  ${count}`);
      }
      push("");
    }
  }

  if (stats.commonPrefixes.length > 0) {
    push("  🏷  COMMIT TYPES (conventional commits)", "  " + "─".repeat(54));
    for (const { prefix, count } of stats.commonPrefixes.slice(0, 6)) {
      push(`  ${prefix.padEnd(12)} ${count} commit${count !== 1 ? "s" : ""}`);
    }
    push("");
  }

  if (highlights.length > 0) {
    push("  🔥 BIGGEST CHANGES", "  " + "─".repeat(54));
    for (const commit of highlights) {
      const msg = commit.message.length > 52 ? commit.message.slice(0, 49) + "..." : commit.message;
      push(`  ${commit.hash}  ${msg}`);
      push(`  ${" ".repeat(10)}+${commit.insertions} -${commit.deletions} in ${commit.filesChanged} file${commit.filesChanged !== 1 ? "s" : ""}`);
    }
    push("");
  }

  if (stats.topAuthors.length > 1) {
    push("  👤 TOP CONTRIBUTORS", "  " + "─".repeat(54));
    for (const { author, commits } of stats.topAuthors) {
      push(`  ${author.padEnd(24)} ${commits} commit${commits !== 1 ? "s" : ""}`);
    }
    push("");
  }

  return lines.join("\n");
}

export function renderMarkdown(
  repoName: string,
  period: string,
  stats: RecapStats,
  langStats: Record<string, number>,
  highlights: Commit[]
): string {
  const lines: string[] = [];
  lines.push(`## Git Recap — ${repoName}`);
  lines.push(`> ${period}`);
  lines.push("");
  lines.push("### Summary");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Commits | **${stats.totalCommits}** |`);
  lines.push(`| Files changed | ${stats.totalFilesChanged} |`);
  lines.push(`| Lines added | +${num(stats.totalInsertions)} |`);
  lines.push(`| Lines removed | -${num(stats.totalDeletions)} |`);
  lines.push(`| Net change | ${stats.netLinesChanged >= 0 ? "+" : ""}${num(stats.netLinesChanged)} |`);
  lines.push(`| Active days | ${stats.activeDays} |`);
  lines.push("");

  if (Object.keys(langStats).length > 0) {
    lines.push("### Languages");
    const total = Object.values(langStats).reduce((s, n) => s + n, 0);
    Object.entries(langStats).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([lang, n]) => {
      lines.push(`- **${lang}**: ${(n / total * 100).toFixed(1)}%`);
    });
    lines.push("");
  }

  if (highlights.length > 0) {
    lines.push("### Highlights");
    for (const commit of highlights) {
      lines.push(`- \`${commit.hash}\` ${commit.message} (+${commit.insertions}/-${commit.deletions})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function renderJson(
  repoName: string,
  period: string,
  stats: RecapStats,
  langStats: Record<string, number>,
  highlights: Commit[]
): string {
  return JSON.stringify({ repoName, period, stats, langStats, highlights }, null, 2);
}
