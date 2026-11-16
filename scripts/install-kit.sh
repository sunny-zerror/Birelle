#!/usr/bin/env bash
# Installs dependencies on a build server (Vercel / AWS). @zcom/storefront-kit
# comes from a private GitHub repo, so the build needs read access to it, from
# either hosting env variable:
#   GITHUB_TOKEN        the shared fine-grained read token (the kit README's
#                       "Build token"; a Vercel team shared variable)
#   KIT_DEPLOY_KEY_B64  base64 of a read-only SSH deploy key on the kit repo
# Without either (e.g. on your machine) it is a plain `npm ci` using your own
# GitHub access. Neither value is ever printed.
set -euo pipefail

if [ -n "${GITHUB_TOKEN:-}" ]; then
  # The lockfile records the kit as git+ssh://git@github.com/…: fetch it over HTTPS with the token
  git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/"
  git config --global --add url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"
  # npm may also clone over plain https://github.com/ once GitHub's tarball download answers 404 (a
  # private repo always does): rewrite that form too (kit README "Build token")
  git config --global --add url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
  echo "install-kit: using GITHUB_TOKEN"
elif [ -n "${KIT_DEPLOY_KEY_B64:-}" ]; then
  mkdir -p ~/.ssh
  chmod 700 ~/.ssh
  echo "$KIT_DEPLOY_KEY_B64" | base64 -d > ~/.ssh/zcom_kit
  chmod 600 ~/.ssh/zcom_kit
  # GitHub's published host key (pinned, so the build never trusts a fake host)
  echo "github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl" >> ~/.ssh/known_hosts
  git config --global core.sshCommand "ssh -i ~/.ssh/zcom_kit -o IdentitiesOnly=yes"
  git config --global url."ssh://git@github.com/Zerror-Studios/".insteadOf "https://github.com/Zerror-Studios/"
  echo "install-kit: using the kit deploy key"
fi

npm ci
