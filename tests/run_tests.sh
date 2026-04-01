#!/bin/bash
# =============================================================
# Robot Framework API Test Runner for aero-fru
# =============================================================
# Prerequisites:
#   1. Docker containers running: docker-compose up -d
#   2. Test data seeded (see testdata/seed_test_data.sql)
#   3. Python + pip installed
#
# Usage:
#   ./run_tests.sh              # Run all tests
#   ./run_tests.sh 01_auth      # Run specific suite
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Install dependencies if needed
if ! python -m robot --version &>/dev/null; then
    echo "[*] Installing Robot Framework dependencies..."
    pip install -r requirements.txt
fi

# Create output directory
mkdir -p results

# Run tests
if [ -n "$1" ]; then
    echo "[*] Running test suite: $1"
    python -m robot --outputdir results "$1.robot"
else
    echo "[*] Running all test suites..."
    python -m robot --outputdir results .
fi

echo "[*] Results available in: $SCRIPT_DIR/results/"
echo "[*]   report.html  - Human-readable report"
echo "[*]   log.html     - Detailed execution log"
echo "[*]   output.xml   - Machine-readable output"
