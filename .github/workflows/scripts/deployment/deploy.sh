#!/bin/bash

deploy() {
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# !!!!! Uncomment after first deployment !!!!!
  # "$script_dir/../db-backup/backup.sh"

  "$script_dir/stack-deploy.sh" || exit 1
  "$script_dir/healthcheck.sh" || exit 1
  "$script_dir/post-job.sh"
}

deploy