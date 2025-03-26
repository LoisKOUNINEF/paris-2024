#!/bin/bash

set -e

if [[ -z "$STACK_NAME" ]]; then
  echo "Error: STACK_NAME is not set. Please provide it as an environment variable or argument."
  exit 1
fi

POSTGRES_SERVICE="${PROJECT_LOWER}-${STACK_NAME}_postgres"
if ! docker service ls --format "{{.Name}}" | grep -q "$POSTGRES_SERVICE"; then
  echo "PostgreSQL service '$POSTGRES_SERVICE' is not running."
  exit 1
fi

BACKUP_DIR="/backups"
if [[ -z "$BACKUP_FILE" ]]; then
  BACKUP_FILE=$(ls -t "$BACKUP_DIR"/${DB_NAME}_backup_*.sql.gz.enc 2>/dev/null | head -n 1)
  if [[ -z "$BACKUP_FILE" ]]; then
    echo "Error: No backup file found in '$BACKUP_DIR'."
    exit 1
  fi
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

SECRETS_DIR=$(mktemp -d)
trap "rm -rf $SECRETS_DIR" EXIT

docker cp $(docker ps -q -f "name=${POSTGRES_SERVICE}_"):/run/secrets/. "$SECRETS_DIR" 2>/dev/null

PG_USER=$(cat "$SECRETS_DIR/$PROJECT_LOWER_${STACK_NAME}_db_user" 2>/dev/null)
PG_PASSWORD=$(cat "$SECRETS_DIR/$PROJECT_LOWER_${STACK_NAME}_db_password" 2>/dev/null)
DB_NAME=$(cat "$SECRETS_DIR/$PROJECT_LOWER_${STACK_NAME}_db_name" 2>/dev/null)
ENCRYPTION_PASSWORD=$(cat "$SECRETS_DIR/encryption_password" 2>/dev/null)

if [[ -z "$PG_USER" || -z "$PG_PASSWORD" || -z "$DB_NAME" || -z "$ENCRYPTION_PASSWORD" ]]; then
  echo "Error: Missing required database credentials or encryption password."
  exit 1
fi

DB_HOST="$(docker inspect -f '{{.Endpoint.VirtualIPs}}' "$POSTGRES_SERVICE" | grep -oE '[0-9.]+')"
DB_PORT="5432"

openssl enc -d -aes-256-cbc -salt -pbkdf2 -pass pass:"$ENCRYPTION_PASSWORD" -in "$BACKUP_FILE" | \
  gunzip | docker exec -e PGPASSWORD="$PG_PASSWORD" -T $(docker ps -q -f "name=${POSTGRES_SERVICE}_") psql -h "$DB_HOST" -p "$DB_PORT" -U "$PG_USER" "$DB_NAME"

if [[ $? -eq 0 ]]; then
  echo "Restore successful: $BACKUP_FILE"
else
  echo "Restore failed."
  exit 1
fi

exit 0
