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
