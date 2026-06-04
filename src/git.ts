import { execSync } from "child_process";
import * as path from "path";

export interface Commit {
  hash: string;
  date: string;
  author: string;
  message: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

export interface DayStats {
  date: string;
  commits: number;
  insertions: number;
  deletions: number;
}

function git(cmd: string, cwd: string): string {
  try {
    return execSync(`git ${cmd}`, { cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

export function isGitRepo(dir: string): boolean {
  return git("rev-parse --git-dir", dir) !== "";
}

export function getRepoName(dir: string): string {
  const remote = git("remote get-url origin", dir);
  if (remote) {
    return path.basename(remote.replace(/\.git$/, "").replace(/\/$/, ""));
  }
  return path.basename(path.resolve(dir));
}

export function getCurrentBranch(dir: string): string {
  return git("rev-parse --abbrev-ref HEAD", dir) || "main";
}

export function getCommits(dir: string, since: string, until?: string): Commit[] {
  const untilFlag = until ? `--until="${until}"` : "";
  const logOut = git(
    `log --since="${since}" ${untilFlag} --pretty=format:"%H|%ad|%an|%s" --date=short --numstat`,
    dir
  );

  if (!logOut) return [];

  const commits: Commit[] = [];
  const blocks = logOut.split(/(?=^[a-f0-9]{40}\|)/m);

  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    if (!lines[0]) continue;

    const header = lines[0].split("|");
    if (header.length < 4) continue;

    const [hash, date, author, ...msgParts] = header;
    const message = msgParts.join("|");

    let insertions = 0;
    let deletions = 0;
    let filesChanged = 0;

    for (const line of lines.slice(1)) {
      const parts = line.split("\t");
      if (parts.length === 3) {
        insertions += parseInt(parts[0] ?? "0") || 0;
        deletions += parseInt(parts[1] ?? "0") || 0;
        filesChanged++;
      }
    }

    commits.push({
      hash: hash?.slice(0, 8) ?? "",
      date: date ?? "",
      author: author ?? "",
      message: message ?? "",
      filesChanged,
      insertions,
      deletions,
    });
  }

  return commits;
}

export function getLanguageStats(dir: string, since: string): Record<string, number> {
  const raw = git(
    `log --since="${since}" --pretty=format:"" --numstat`,
    dir
  );

  const stats: Record<string, number> = {};
  for (const line of raw.split("\n")) {
    const parts = line.split("\t");
    if (parts.length === 3) {
      const file = parts[2] ?? "";
      const ext = file.split(".").pop()?.toLowerCase() ?? "";
      if (ext && ext.length < 8 && !file.includes("{")) {
        stats[ext] = (stats[ext] ?? 0) + (parseInt(parts[0] ?? "0") || 0);
      }
    }
  }
  return stats;
}

export function getDayStats(commits: Commit[]): DayStats[] {
  const map: Record<string, DayStats> = {};
  for (const c of commits) {
    if (!c.date) continue;
    if (!map[c.date]) map[c.date] = { date: c.date, commits: 0, insertions: 0, deletions: 0 };
    map[c.date]!.commits++;
    map[c.date]!.insertions += c.insertions;
    map[c.date]!.deletions += c.deletions;
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

export function getSinceDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0]!;
}
