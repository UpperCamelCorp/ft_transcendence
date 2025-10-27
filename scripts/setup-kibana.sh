#!/bin/bash
set -e

echo "🔧 Setting up Kibana authentication..."

# Use environment variables with defaults
ELASTIC_USER=${ELASTIC_USERNAME:-elastic}
ELASTIC_PASS=${ELASTIC_PASSWORD:-transcendence2024}
KIBANA_PASS=${KIBANA_PASSWORD:-transcendence2024}

# Wait for Elasticsearch to be ready
echo "⏳ Waiting for Elasticsearch to be ready..."
until curl -s -u $ELASTIC_USER:$ELASTIC_PASS http://elasticsearch:9200/_cluster/health | grep -q '"status":"green\|yellow"'; do
  echo "   Still waiting for Elasticsearch..."
  sleep 5
done

echo "✅ Elasticsearch is ready!"

# Set password for kibana_system user
echo "🔑 Setting kibana_system user password..."
RESPONSE=$(curl -s -X POST "http://elasticsearch:9200/_security/user/kibana_system/_password" \
  -u $ELASTIC_USER:$ELASTIC_PASS \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"$KIBANA_PASS\"}")

if echo "$RESPONSE" | grep -q '{}'; then
    echo "✅ Kibana system user password set successfully!"
else
    echo "❌ Failed to set kibana_system password"
    echo "Response: $RESPONSE"
    exit 1
fi

# Test the authentication
echo "🧪 Testing kibana_system authentication..."
AUTH_TEST=$(curl -s -u kibana_system:$KIBANA_PASS http://elasticsearch:9200/_cluster/health)
if echo "$AUTH_TEST" | grep -q 'cluster_name'; then
    echo "✅ Authentication test successful!"
else
    echo "❌ Authentication test failed"
    echo "Response: $AUTH_TEST"
    exit 1
fi

echo "🎉 Kibana authentication setup complete!"