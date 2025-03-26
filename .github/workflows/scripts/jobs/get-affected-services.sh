#!/bin/bash

affected_services=$(npx nx show projects --affected --type=app --base=origin/main --exclude=\*e2e)

echo "Raw affected services: $affected_services"

services=()

while IFS= read -r service; do
  services+=("$service")
done <<< "$affected_services"

echo "Affected services:"
for service in "${services[@]}"; do
  echo "$service"
done

if [ -z "$services" ]; then
  echo "No affected services found. Exiting..."
  exit 1
fi

joined_services=$(IFS=','; echo "${services[*]}")

echo "services=$joined_services" >> $GITHUB_OUTPUT
