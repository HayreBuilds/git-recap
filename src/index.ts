#!/usr/bin/env node
import * as path from "path";
import { isGitRepo, getRepoName, getCurrentBranch, getCommits, getLanguageStats, getDayStats, getSinceDate } from "./git.js";
import { analyzeCommits, mapLanguages, getHighlightCommits } from "./analyzer.js";
import { renderText, renderMarkdown, renderJson } from "./reporter.js";

const VERSION = "1.0.0";
const HELP = `
git-recap v${VERSION} — Git activity report generator

Usage:
  git-recap                   Report for the past 7 days
  git-recap --days 30         Report for the past 30 days
  git-recap --since 2024-01-01

Options:
  --days <n>       Look back N days (default: 7)
  --since <date>   Start date in YYYY-MM-DD format
  --until <date>   End date in YYYY-MM-DD format
  --dir <path>     Target git repo (default: current directory)
  --format <fmt>   Output format: text (default), markdown, json
  --output <file>  Write to file instead of stdout
  --author <name>  Filter by author name
  -v, --version    Print version
  -h, --help       Show help

Examples:
  git-recap
  git-recap --days 30 --format markdown
  git-recap --since 2024-01-01 --until 2024-01-31
  git-recap --format json | jq '.stats.totalCommits'
  git-recap --format markdown > weekly-report.md
`;

function parseArgs(argv: string[]) {
  const opts = {
    days: 7, since: "", until: "", dir: ".",
    format: "text" as "text" | "markdown" | "json",
    output: "", author: "",
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "-h" || a === "--help") { process.stdout.write(HELP); process.exit(0); }
    if (a === "-v" || a === "--version") { process.stdout.write(`git-recap v${VERSION}\n`); process.exit(0); }
    if (a === "--days" && argv[i+1]) { opts.days = parseInt(argv[++i]!, 10); continue; }
    if (a === "--since" && argv[i+1]) { opts.since = argv[++i]!; continue; }
    if (a === "--until" && argv[i+1]) { opts.until = argv[++i]!; continue; }
    if (a === "--dir" && argv[i+1]) { opts.dir = argv[++i]!; continue; }
    if (a === "--format" && argv[i+1]) { opts.format = argv[++i] as "text" | "markdown" | "json"; continue; }
    if (a === "--output" && argv[i+1]) { opts.output = argv[++i]!; continue; }
    if (a === "--author" && argv[i+1]) { opts.author = argv[++i]!; continue; }
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const repoDir = path.resolve(opts.dir);

  if (!isGitRepo(repoDir)) {
    process.stderr.write(`  ✖ Not a git repository: ${repoDir}\n`);
    process.exit(1);
  }

  const since = opts.since || getSinceDate(opts.days);
  const period = opts.since
    ? `${opts.since}${opts.until ? " → " + opts.until : " → today"}`
    : `Past ${opts.days} days`;

  const repoName = getRepoName(repoDir);
  const branch = getCurrentBranch(repoDir);

  if (opts.format === "text") process.stderr.write(`  Analyzing ${repoName} (${branch})...\n`);

  let commits = getCommits(repoDir, since, opts.until || undefined);

  if (opts.author) {
    commits = commits.filter(c => c.author.toLowerCase().includes(opts.author.toLowerCase()));
  }

  if (commits.length === 0) {
    process.stdout.write(`No commits found in ${period}.\n`);
    process.exit(0);
  }

  const dayStats = getDayStats(commits);
  const stats = analyzeCommits(commits, dayStats);
  const rawLang = getLanguageStats(repoDir, since);
  const langStats = mapLanguages(rawLang);
  const highlights = getHighlightCommits(commits, 5);

  let output: string;
  if (opts.format === "markdown") {
    output = renderMarkdown(repoName, period, stats, langStats, highlights);
  } else if (opts.format === "json") {
    output = renderJson(repoName, period, stats, langStats, highlights);
  } else {
    output = renderText(repoName, period, stats, langStats, highlights, dayStats);
  }

  if (opts.output) {
    const fs = require("fs");
    fs.writeFileSync(path.resolve(opts.output), output, "utf-8");
    process.stderr.write(`  ✔ Written to ${opts.output}\n`);
  } else {
    process.stdout.write(output + "\n");
  }
}

main();
