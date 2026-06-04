# 📊 git-recap

[![Build Status](https://img.shields.io/github/actions/workflow/status/HayreBuilds/git-recap/ci.yml?branch=main)](https://github.com/HayreBuilds/git-recap/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/HayreBuilds/git-recap/pulls)
[![Star History](https://img.shields.io/github/stars/HayreBuilds/git-recap?style=social)](https://github.com/HayreBuilds/git-recap/stargazers)

**Weekly Git Activity Report Generator. Turn your commit history into professional summaries in seconds.**

> Stop struggling to remember what you did this week. **git-recap** analyzes your local repositories and generates perfectly formatted updates for standups, weekly reports, or LinkedIn.

---

## 🚀 Quick Start

```bash
# Generate a summary for the last 7 days in the current repo
npx git-recap

# Summary for the last 30 days across all your projects
git-recap --days 30 --dir ~/projects
```

---

## ✨ Key Features

- **📝 Automated Summaries**: Converts technical commit messages into readable bullet points.
- **📈 Productivity Metrics**: Tracks lines changed, commit frequency, and your most active days.
- **🌍 Multi-Repo Support**: Scan an entire directory of projects at once.
- **🎨 Multiple Formats**: Output as Markdown, Terminal Table, or clean JSON for integrations.
- **⚡ Fast & Private**: Runs entirely locally. Your code never leaves your machine.

---

## 💻 Installation

```bash
npm install -g git-recap
```

---

## 🛠️ Usage Examples

### Standard Weekly Recap
```bash
git-recap --days 7
```

### Team/Manager Report (Detailed)
```bash
git-recap --days 14 --detailed --format markdown > report.md
```

### Monthly Summary across all Projects
```bash
git-recap --days 30 --dir ~/work --dir ~/personal
```

---

## 🔍 How it Works

1. **Git Log Analysis**: Uses `git log` to extract commit messages, authors, and timestamps.
2. **Stats Calculation**: Computes churn (additions/deletions) and commit density.
3. **Clustering**: Groups related commits by scope (e.g., `feat`, `fix`, `docs`) if conventional commits are used.
4. **Formatting**: Passes the data through specialized reporters for the final output.

---

## ⚙️ Configuration Options

| Option | Default | Description |
|:---|:---|:---|
| `--days <n>` | `7` | Number of days to look back |
| `--dir <path>` | `.` | Directory to scan (can be used multiple times) |
| `--format <type>` | `table` | Output format: `table`, `markdown`, `json` |
| `--detailed` | `false` | Include per-commit details and churn stats |
| `--author <name>` | (you) | Filter commits by a specific author |

---

## 🤝 Contributing

Help make **git-recap** better! Check out our [Contributing Guide](CONTRIBUTING.md).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 💖 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=HayreBuilds/git-recap&type=Date)](https://star-history.com/#HayreBuilds/git-recap&Date)
