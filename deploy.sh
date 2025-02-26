#!/bin/bash

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Cloud Functions
echo "Deploying Cloud Functions..."
firebase deploy --only functions

echo "Deployment completed successfully!" 