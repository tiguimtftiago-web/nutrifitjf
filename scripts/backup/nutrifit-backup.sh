#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

required=(SUPABASE_DB_URL BACKUP_PASSPHRASE R2_ACCOUNT_ID R2_BUCKET_NAME AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY RCLONE_DRIVE_REMOTE RCLONE_CONFIG)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    printf 'Missing required environment variable: %s\n' "$name" >&2
    exit 2
  fi
done

for command in supabase aws rclone gpg tar sha256sum git; do
  command -v "$command" >/dev/null 2>&1 || {
    printf 'Required command not found: %s\n' "$command" >&2
    exit 2
  }
done

timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT
mkdir -p "$workdir/payload/database" "$workdir/payload/source"

# Supabase CLI logical dumps exclude managed auth/storage schemas by design.
# These commands are read-only against the source database.
supabase db dump --remote="$SUPABASE_DB_URL" -f "$workdir/payload/database/schema.sql"
supabase db dump --remote="$SUPABASE_DB_URL" --data-only --use-copy -f "$workdir/payload/database/data.sql"
supabase db dump --remote="$SUPABASE_DB_URL" --role-only -f "$workdir/payload/database/roles.sql"
supabase db dump --remote="$SUPABASE_DB_URL" --schema supabase_migrations -f "$workdir/payload/database/migration-history-schema.sql"
supabase db dump --remote="$SUPABASE_DB_URL" --schema supabase_migrations --data-only --use-copy -f "$workdir/payload/database/migration-history-data.sql"

git archive --format=tar.gz --output="$workdir/payload/source/repository.tar.gz" HEAD

cat > "$workdir/payload/manifest.txt" <<EOF
backup_timestamp_utc=$timestamp
repository_commit=$(git rev-parse HEAD)
supabase_project_ref=${SUPABASE_PROJECT_REF:-not-set}
backup_format=Supabase CLI logical SQL dumps + git archive
managed_schemas_note=Supabase CLI excludes auth, storage, and extension-managed schemas
EOF

archive="$workdir/nutrifit-$timestamp.tar.gz"
encrypted="$archive.gpg"
tar -czf "$archive" -C "$workdir/payload" .
sha256sum "$archive" > "$archive.sha256"

gpg --batch --yes --pinentry-mode loopback \
  --passphrase "$BACKUP_PASSPHRASE" \
  --symmetric --cipher-algo AES256 \
  --output "$encrypted" "$archive"

object_key="daily/$(basename "$encrypted")"
endpoint="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
AWS_DEFAULT_REGION=auto aws s3 cp "$encrypted" "s3://${R2_BUCKET_NAME}/$object_key" \
  --endpoint-url "$endpoint" --only-show-errors
AWS_DEFAULT_REGION=auto aws s3 cp "$archive.sha256" "s3://${R2_BUCKET_NAME}/$object_key.sha256" \
  --endpoint-url "$endpoint" --only-show-errors

rclone copy "$encrypted" "$RCLONE_DRIVE_REMOTE/daily" --config "$RCLONE_CONFIG" --checkers 2 --transfers 1
rclone copy "$archive.sha256" "$RCLONE_DRIVE_REMOTE/daily" --config "$RCLONE_CONFIG" --checkers 2 --transfers 1

AWS_DEFAULT_REGION=auto aws s3api head-object --bucket "$R2_BUCKET_NAME" --key "$object_key" \
  --endpoint-url "$endpoint" >/dev/null
rclone ls "$RCLONE_DRIVE_REMOTE/daily" --config "$RCLONE_CONFIG" | awk -v expected="$(basename "$encrypted")" '$2 == expected { found=1 } END { exit !found }'

printf 'Backup completed and verified in R2 and Google Drive: %s\n' "$(basename "$encrypted")"
