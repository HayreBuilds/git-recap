#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

git init
git config user.email "dev@git-recap.io"
git config user.name "git-recap"

# 1
git add package.json tsconfig.json .gitignore
git commit -m "chore: initialize project with TypeScript config"

# 2
git add LICENSE
git commit -m "chore: add MIT license"

# 3
git add src/git.ts
git commit -m "feat: implement git command wrappers for commit history and stats

- isGitRepo() detects valid git repositories
- getCommits() parses --numstat for per-file insertion/deletion counts
- getLanguageStats() aggregates lines changed by file extension
- getDayStats() groups commits by calendar day
- getSinceDate() generates look-back date strings"

# 4
git add src/analyzer.ts
git commit -m "feat: add commit analytics engine

- analyzeCommits() computes totals, streaks, day-of-week breakdown
- mapLanguages() normalizes file extensions to display language names
- getHighlightCommits() finds biggest changes by lines modified
- Conventional commit prefix extraction (feat/fix/chore/docs/etc.)"

# 5
git add src/reporter.ts
git commit -m "feat: build rich terminal, markdown, and JSON reporters

- renderText(): Unicode box-drawing, bar charts, TTY color support
- renderMarkdown(): clean tables for Notion, GitHub, LinkedIn paste
- renderJson(): full structured output for scripting with jq
- bar() helper for proportional ASCII bar charts
- Graceful degradation when stdout is not a TTY"

# 6
git add src/index.ts
git commit -m "feat: wire up CLI with full argument parsing

- --days, --since, --until date range flags
- --dir for targeting a different repository
- --format text|markdown|json
- --output to write directly to a file
- --author to filter by contributor name
- Version and help flags"

# 7
git add README.md
git commit -m "docs: write comprehensive README with examples and screenshots"

# 8
cat > CONTRIBUTING.md << 'EOF'
# Contributing to git-recap

## Setup

```bash
git clone https://github.com/yourusername/git-recap
cd git-recap
npm install
ts-node src/index.ts --days 7
```

## Adding a language mapping

Edit `LANG_NAMES` in `src/analyzer.ts`. File extensions are lowercased before lookup.

## Adding a new output format

1. Add a new function in `src/reporter.ts`
2. Add the format option to `parseArgs` in `src/index.ts`
3. Update the README options table
EOF
git add CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING guide"

# 9 — CI
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install && npm run typecheck
EOF
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions typecheck workflow"

# 10 — examples
mkdir -p examples
cat > examples/weekly-standup.sh << 'EOF'
#!/bin/bash
# Generate a weekly standup report
git-recap --days 7 --format markdown | pbcopy
echo "Weekly standup report copied to clipboard!"
EOF
cat > examples/monthly-summary.sh << 'EOF'
#!/bin/bash
# Monthly summary for a specific month
git-recap --since 2025-01-01 --until 2025-01-31 --format markdown > january-report.md
echo "Report written to january-report.md"
EOF
cat > examples/team-report.sh << 'EOF'
#!/bin/bash
# Summarize each team member's week
for author in "Alice" "Bob" "Carol"; do
  echo "## $author"
  git-recap --days 7 --author "$author" --format markdown
done
EOF
git add examples/
git commit -m "docs: add shell script examples for standup, monthly, and team reports"

# 11 — npmignore
cat > .npmignore << 'EOF'
src/
tsconfig.json
examples/
CONTRIBUTING.md
.github/
*.tsbuildinfo
EOF
git add .npmignore
git commit -m "chore: add .npmignore to keep npm package lean"

# 12 — streak improvement
cat >> src/analyzer.ts << 'EOF'

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
EOF
git add src/analyzer.ts
git commit -m "feat: add getCurrentStreak() for today's active commit streak"

# 13 — expand language map
cat >> src/analyzer.ts << 'EOF'
// Extended language aliases for common shorthands
export const EXTRA_ALIASES: Record<string, string> = {
  "mjs":"JavaScript","cjs":"JavaScript","mts":"TypeScript","cts":"TypeScript",
  "jsx":"JavaScript","tsx":"TypeScript","rb":"Ruby","ex":"Elixir","exs":"Elixir",
  "hs":"Haskell","clj":"Clojure","fs":"F#","ml":"OCaml","nim":"Nim","zig":"Zig",
};
EOF
git add src/analyzer.ts
git commit -m "feat: extend language alias table with Elixir, Haskell, Zig, Nim, etc."

# 14 — CHANGELOG
cat > CHANGELOG.md << 'EOF'
# Changelog

## 1.0.0

- Git commit history parser with numstat for per-file stats
- Terminal reporter with Unicode bar charts and TTY colors
- Markdown reporter for Notion/GitHub/LinkedIn
- JSON reporter for scripting
- Day-of-week breakdown, language breakdown, streak tracking
- Top contributors list
- Highlights: biggest commits by lines changed
- Zero dependencies — pure Node.js built-ins and git CLI
EOF
git add CHANGELOG.md
git commit -m "chore: add CHANGELOG for 1.0.0 release"

# 15 — version in package.json finalize
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.repository = { type: 'git', url: 'https://github.com/yourusername/git-recap' };
p.bugs = { url: 'https://github.com/yourusername/git-recap/issues' };
p.homepage = 'https://github.com/yourusername/git-recap#readme';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
"
git add package.json
git commit -m "chore: add repository, bugs, and homepage fields to package.json"

echo "✔ git-recap: 15 commits created"
