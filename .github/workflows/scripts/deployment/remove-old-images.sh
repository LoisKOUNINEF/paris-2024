#!/bin/bash

remove_old_images() {
  sed -n 's/.*image:\s*\([^:]*\).*/\1/p' "$STACK_NAME".yml | sort -u |
  while IFS= read -r image; do
    # keep the current and the previous (rollback) image, sorted by creation date
    docker image ls "$image" --format "{{.CreatedAt}}\t{{.Repository}}:{{.Tag}}" |
    sort -r |
    tail -n +3 |
    cut -f2 |
    xargs -r docker rmi || true
  done
}

remove_old_images