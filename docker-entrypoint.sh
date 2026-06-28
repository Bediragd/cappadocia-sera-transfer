#!/bin/sh
set -e

# Host volume (./public/uploads) root ile olusursa nextjs (uid 1001) yazamaz — her start'ta duzelt
mkdir -p /app/public/uploads/applications
chown -R nextjs:nodejs /app/public/uploads

exec su-exec nextjs:nodejs "$@"
