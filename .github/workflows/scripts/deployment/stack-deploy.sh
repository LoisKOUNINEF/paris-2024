#!/bin/bash

new_yaml() {
  echo "Replacing $STACK_NAME yaml file"

  mv "$STACK_NAME".yml prev-"$STACK_NAME".yml
  mv new-"$STACK_NAME".yml "$STACK_NAME".yml
}

restore_yaml() {
  echo "Restoring previous $STACK_NAME yaml file" >&2

  mv "$STACK_NAME".yml new-"$STACK_NAME".yml
  mv prev-"$STACK_NAME".yml "$STACK_NAME".yml
}

pull_images() {
  if docker compose version > /dev/null 2>&1; then
    docker compose -f "$STACK_NAME".yml pull
  else
    docker-compose -f "$STACK_NAME".yml pull
  fi
}

deploy_stack() {
  docker stack deploy --with-registry-auth -c "$STACK_NAME".yml "$PROJECT_LOWER"-"$STACK_NAME"
}

stack_deploy() {
  local script_dir="$(dirname "$0")"

  new_yaml

  echo "Deploying $STACK_NAME..."

  "$script_dir/docker-login.sh"
  "$script_dir/replace-placeholders.sh"

  # don't deploy (and trigger a rollback) when the images can't be pulled
  if ! pull_images; then
    echo "ERROR: Failed to pull $STACK_NAME images. Check that DOCKER_AUTH is a classic PAT with read:packages." >&2
    restore_yaml
    "$script_dir/docker-logout.sh"
    exit 1
  fi

  deploy_stack
}

stack_deploy
