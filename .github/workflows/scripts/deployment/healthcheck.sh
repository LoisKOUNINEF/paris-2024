#!/bin/bash

healthcheck() {
  local timeout=150
  local start_time=$(date +%s)
  local all_healthy=true
  local exclude="migrations"

  while true; do
    all_healthy=true
    services=$(docker service ls --format "{{.Name}}" --filter "name="$PROJECT_LOWER"-"$STACK_NAME"")

    for service in $services; do
      if [ "$service" = ""$PROJECT_LOWER"-"$STACK_NAME"_"$PROJECT_LOWER"-"$STACK_NAME"-"$exclude"" ]; then
        continue
      fi

      replicas=$(docker service ls --filter name=$service --format "{{.Replicas}}")
      running=$(echo $replicas | cut -d'/' -f1)
      expected=$(echo $replicas | cut -d'/' -f2)

      if [ "$running" = "$expected" ]; then
        echo "$service is healthy ($replicas)"
      else
        echo "$service is unhealthy ($replicas)"
        all_healthy=false
      fi
    done

    if $all_healthy; then
      echo "All services are healthy"
      return 0
    fi

    current_time=$(date +%s)
    elapsed=$((current_time - start_time))

    if [ $elapsed -ge $timeout ]; then
      echo "Timeout reached. Not all services are healthy."
      return 1
    fi

    echo "Waiting for all services to become healthy..."
    sleep 10
  done
}

script_dir="$(dirname "$0")"
if ! healthcheck; then
  "$script_dir/rollback.sh"
fi