#!/bin/bash
# Monthly summary for a specific month
git-recap --since 2025-01-01 --until 2025-01-31 --format markdown > january-report.md
echo "Report written to january-report.md"
