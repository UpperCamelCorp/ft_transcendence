#!/bin/bash
set -e

echo "Setting up ELK Stack for ft_transcendence..."

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch to be ready..."
until curl -s -u elastic:transcendence2024 http://elasticsearch:9200/_cluster/health | grep -q '"status":"green\|yellow"'; do
  echo "Still waiting for Elasticsearch..."
  sleep 5
done

echo "Elasticsearch is ready!"

# Create ILM policy for log retention
echo "Creating Index Lifecycle Management policy..."
curl -s -X PUT "http://elasticsearch:9200/_ilm/policy/transcendence-policy" \
  -u elastic:transcendence2024 \
  -H "Content-Type: application/json" \
  -d '{
    "policy": {
      "phases": {
        "hot": {
          "min_age": "0ms",
          "actions": {
            "rollover": {"max_size": "1GB", "max_age": "7d", "max_docs": 1000000},
            "set_priority": {"priority": 100}
          }
        },
        "warm": {
          "min_age": "7d",
          "actions": {
            "set_priority": {"priority": 50},
            "allocate": {"number_of_replicas": 0}
          }
        },
        "cold": {
          "min_age": "30d",
          "actions": {
            "set_priority": {"priority": 0},
            "allocate": {"number_of_replicas": 0}
          }
        },
        "delete": {
          "min_age": "90d",
          "actions": {"delete": {}}
        }
      }
    }
  }'

echo "ILM policy created successfully!"

# Generate Kibana service account token
echo "Generating Kibana service account token..."
TOKEN=$(docker exec transcendence-elasticsearch \
  bin/elasticsearch-service-tokens create elastic/kibana kibana-token | grep '"value"' | awk '{print $2}' | tr -d '",')

echo "Token generated: $TOKEN"

# Export token for Kibana
export ELASTICSEARCH_SERVICEACCOUNTTOKEN=$TOKEN

echo "Starting Kibana..."
exec /usr/share/kibana/bin/kibana
