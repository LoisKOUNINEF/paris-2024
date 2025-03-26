#!/bin/bash

set -e

POSTGRES_SERVICE="$PROJECT_LOWER-${STACK_NAME}_postgres"
if ! docker service ls --format "{{.Name}}" | grep -q "$POSTGRES_SERVICE"; then
  echo "PostgreSQL service '$POSTGRES_SERVICE' is not running."
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

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

DB_HOST="$(docker inspect -f '{{.Endpoint.VirtualIPs}}' "$POSTGRES_SERVICE" | grep -oE '[0-9.]+')"
DB_PORT="5432"

BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$TIMESTAMP.sql.gz.enc"

docker exec -e PGPASSWORD="$PG_PASSWORD" -T $(docker ps -q -f "name=${POSTGRES_SERVICE}_") pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$PG_USER" "$DB_NAME" | \
  gzip | openssl enc -aes-256-cbc -salt -pbkdf2 -pass pass:"$ENCRYPTION_PASSWORD" > "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
  echo "Backup successful: $BACKUP_FILE"
else
  echo "Backup failed."
  exit 1
fi

find "$BACKUP_DIR" -type f -name "${DB_NAME}_backup_*.sql.gz.enc" -mtime +7 -exec rm {} \;

exit 0
