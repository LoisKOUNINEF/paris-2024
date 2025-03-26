#!/bin/bash

affected_services=()

while IFS= read -r service; do
  affected_services+=("$service")
done <<< "$AFFECTED_SERVICES"
	        
IFS=',' read -ra services <<< "$affected_services"

for service in "${services[@]}"; do
  docker build --platform linux/amd64 -t ghcr.io/${REPO_LOWER}-${service}:${GITHUB_SHA} -f ./apps/${service}/Dockerfile .
  docker push ghcr.io/${REPO_LOWER}-${service}:${GITHUB_SHA}
done