#!/bin/bash

scale_backend() {
  local scale_value=2
  echo "Scaling backend to $scale_value."

  docker service scale "$PROJECT_LOWER"-"$STACK_NAME"_"$PROJECT_LOWER"-"$STACK_NAME"-server=$scale_value || true
}

scale_backend