# git-recap

> Weekly git activity report generator. Get a beautifully formatted summary of your commit history — paste it into a standup, weekly report, or LinkedIn update.

```
$ git-recap --days 7

  ┌─────────────────────────────────────────────────────┐
  │             git-recap — my-project                  │
  │             Past 7 days                             │
  └─────────────────────────────────────────────────────┘

  📊 SUMMARY
  ──────────────────────────────────────────────────────
  Commits       23
  Files changed 87
  Lines added   +2.4k
  Lines removed -891
  Net change    +1.5k
  Active days   5
  Avg/day       4.6 commits
  Streak        5 consecutive days

  🌐 LANGUAGES
  ──────────────────────────────────────────────────────
  TypeScript     ████████████████  72.4%
  CSS            ████░░░░░░░░░░░░  14.1%
  JSON           ██░░░░░░░░░░░░░░   8.3%
  Markdown       █░░░░░░░░░░░░░░░   5.2%

  📅 ACTIVITY BY DAY
  ──────────────────────────────────────────────────────
  2025-01-13  ████████████░░        6 commits
  2025-01-14  ██████████████████    9 commits
  2025-01-15  ████░░░░░░░░░░        2 commits

  🔥 BIGGEST CHANGES
  ──────────────────────────────────────────────────────
  a3f29b1  feat: implement real-time dashboard with websockets
           +847 -203 in 12 files
```

---

## Install

```bash
npm install -g git-recap
# or without installing:
npx git-recap
```

## Usage

```bash
# Report for the past 7 days (default)
git-recap

# Past 30 days
git-recap --days 30

# Specific date range
git-recap --since 2024-01-01 --until 2024-01-31

# Different repo
git-recap --dir ../other-project

# Output as markdown (paste into Notion, GitHub, etc.)
git-recap --format markdown

# Output as JSON
git-recap --format json | jq '.stats.totalCommits'

# Write to file
git-recap --format markdown > weekly-report.md

# Filter by author
git-recap --author "Jane Doe"

# Monthly report
git-recap --days 30 --format markdown > monthly-report.md
```

## Output Formats

### Text (default)
Beautiful terminal output with Unicode box-drawing, bar charts, and color. Copy-pasteable into a standup or email.

### Markdown (`--format markdown`)
Clean markdown tables and lists. Perfect for Notion, Confluence, GitHub issues, or LinkedIn.

### JSON (`--format json`)
Full structured data. Pipe to `jq`, process in scripts, or save to a database.

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--days <n>` | 7 | Look back N days |
| `--since <date>` | — | Start date (YYYY-MM-DD) |
| `--until <date>` | today | End date (YYYY-MM-DD) |
| `--dir <path>` | `.` | Git repository path |
| `--format` | `text` | `text`, `markdown`, or `json` |
| `--output <file>` | stdout | Write to file |
| `--author <name>` | — | Filter by author name |

## Zero Dependencies

Uses only Node.js built-ins and `git` CLI. No npm packages required.

## License

MIT
