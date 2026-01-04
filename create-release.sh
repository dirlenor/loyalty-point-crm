#!/bin/bash

# Script to create GitHub Release
# Usage: GITHUB_TOKEN=your_token ./create-release.sh

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is required"
  exit 1
fi

REPO_OWNER="dirlenor"
REPO_NAME="loyalty-point-crm"
TAG_NAME="v1.0.0"

# Read release body from RELEASE_NOTES.md
RELEASE_BODY=$(cat RELEASE_NOTES.md | jq -Rs .)

# Create release
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases \
  -d "{
    \"tag_name\": \"$TAG_NAME\",
    \"name\": \"6CAT Point CRM $TAG_NAME\",
    \"body\": $RELEASE_BODY
  }"

