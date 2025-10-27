#!/bin/bash

# This script automates the build and deployment process for the Temporum project.
# It ensures that the client-side code is built before deploying to Firebase.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting client-side build..."
cd /home/valerie-brown/Documents/Temporum/temporum-online/
npm run build
echo "✅ Client build complete."

echo "🚀 Deploying all changes to Firebase..."
cd /home/valerie-brown/Documents/Temporum/
firebase deploy
echo "🎉 Deployment successful!"
