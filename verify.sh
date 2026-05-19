#!/usr/bin/env bash
set -Eeuo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"
SAMPLE_PDF="${SAMPLE_PDF:-samples/sample.pdf}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-2}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-60}"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

validate_json() {
  local json="$1"
  printf '%s' "$json" | jq -e . >/dev/null || fail "Response was not valid JSON"
}

require_command curl
require_command jq

[[ -f "$SAMPLE_PDF" ]] || fail "Sample PDF not found: $SAMPLE_PDF"
[[ -s "$SAMPLE_PDF" ]] || fail "Sample PDF is empty: $SAMPLE_PDF"

upload_response="$(
  curl \
    --fail \
    --show-error \
    --silent \
    --max-time 30 \
    --request POST \
    --form "file=@${SAMPLE_PDF};type=application/pdf" \
    "${API_BASE_URL}/upload"
)" || fail "Upload request failed"

validate_json "$upload_response"

resume_id="$(printf '%s' "$upload_response" | jq -er '.id // empty')" \
  || fail "Upload response did not include .id"

status="$(printf '%s' "$upload_response" | jq -er '.status // empty')" \
  || fail "Upload response did not include .status"

case "$status" in
  pending | processing | completed) ;;
  failed) fail "Upload returned failed status" ;;
  *) fail "Upload returned unexpected status: $status" ;;
esac

attempt=1
while (( attempt <= MAX_ATTEMPTS )); do
  poll_response="$(
    curl \
      --fail \
      --show-error \
      --silent \
      --max-time 15 \
      "${API_BASE_URL}/resume/${resume_id}"
  )" || fail "Polling request failed for resume id: $resume_id"

  validate_json "$poll_response"

  status="$(printf '%s' "$poll_response" | jq -er '.status // empty')" \
    || fail "Poll response did not include .status"

  case "$status" in
    completed)
      printf '%s' "$poll_response" | jq -e '
        (.parsed_data // empty) as $parsed
        | ($parsed | type == "object")
        and (($parsed.full_name // $parsed.name // "") | type == "string")
        and (($parsed.full_name // $parsed.name // "") | length > 0)
        and (($parsed.skills // []) | type == "array")
      ' >/dev/null || fail "Completed response did not contain valid parsed JSON"

      echo "OK"
      exit 0
      ;;
    failed)
      printf '%s\n' "$poll_response" >&2
      fail "Resume processing failed"
      ;;
    pending | processing)
      sleep "$POLL_INTERVAL_SECONDS"
      ;;
    *)
      fail "Poll response returned unexpected status: $status"
      ;;
  esac

  attempt=$((attempt + 1))
done

fail "Timed out waiting for resume processing: $resume_id"
