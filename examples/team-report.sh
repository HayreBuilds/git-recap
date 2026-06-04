#!/bin/bash
# Summarize each team member's week
for author in "Alice" "Bob" "Carol"; do
  echo "## $author"
  git-recap --days 7 --author "$author" --format markdown
done
