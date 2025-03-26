#!/bin/bash

new_yaml() {
  echo "Replacing $STACK_NAME yaml file"

  mv "$STACK_NAME".yml prev-"$STACK_NAME".yml
  mv new-"$STACK_NAME".yml "$STACK_NAME".yml
}

pull_images() {
  docker-compose -f "$STACK_NAME".yml pull
}

deploy_stack() {
  docker stack deploy -c "$STACK_NAME".yml "$PROJECT_LOWER"-"$STACK_NAME"
}

stack_deploy() {
  local script_dir="$(dirname "$0")"

  new_yaml

  echo "Deploying $STACK_NAME..."

  "$script_dir/docker-login.sh"
  "$script_dir/replace-placeholders.sh"

  pull_images
  deploy_stack
}

stack_deploy
