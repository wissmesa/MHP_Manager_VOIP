#!/bin/bash
set -e

echo "📁 Current directory: $(pwd)"
echo "📁 Listing files:"
ls -la

echo "📦 Checking Node.js version:"
node --version

echo "📦 Checking npm version:"
npm --version

echo "🚀 Starting server..."
node server.js
