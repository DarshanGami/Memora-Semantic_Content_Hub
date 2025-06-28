#!/bin/bash

set -e

echo "🚀 Starting Flask app in background..."
python main.py &

# Wait a second for logs to be readable
sleep 1

echo "📡 Starting Kafka consumer (content_consumer.py)..."
python content_consumer.py
