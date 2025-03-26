#!/bin/bash

remove_old_images() {
  images=$(sed -n 's/.*image:\s*\([^:]*\)/\1/p' "$STACK_NAME".yml | sort -u)

  for image in "${images[@]}"; do
    docker image ls "$image" --format "{{.Repository}}:{{.Tag}}" | 
    sort -r | 
    tail -n +3 | 
    xargs -r docker rmi || true
  done
}

remove_old_images