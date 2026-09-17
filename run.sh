#!/bin/bash
# SkyAssist Airline Resolution Agent — One-Command Run Script
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================="
echo "✈️  SkyAssist — Customer-Facing Disruption Resolution Agent"
echo "========================================================="

if [ ! -d "venv" ]; then
    echo "Creating virtual environment in ./venv..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing/verifying dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
    fi
fi

echo ""
echo "Running automated verification tests..."
python3 tests/test_scenarios.py
echo ""

echo "Starting SkyAssist Web Cockpit on http://localhost:8000..."
echo "Press Ctrl+C to terminate."
echo "========================================================="

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
