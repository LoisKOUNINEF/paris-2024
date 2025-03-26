#!/bin/bash

affected_services=()
while IFS= read -r service; do
  affected_services+=("$service")
done <<< "$AFFECTED_SERVICES"

IFS=',' read -ra services <<< "$affected_services"

echo "Updating image tags in new-${STACK_NAME}.yml"

for service in "${services[@]}"; do
  image_name="${REPO_LOWER}-${service}"
  sed -i "s|image: ghcr.io/${image_name}:.*|image: ghcr.io/${image_name}:${GITHUB_SHA}|" new-${STACK_NAME}.yml
done
