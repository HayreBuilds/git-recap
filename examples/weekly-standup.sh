#!/bin/bash
# Generate a weekly standup report
git-recap --days 7 --format markdown | pbcopy
echo "Weekly standup report copied to clipboard!"
