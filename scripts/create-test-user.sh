#!/bin/bash

# Create Test User Script for Supabase Local Development

if [ $# -ne 2 ]; then
    echo "Usage: $0 <email> <password>"
    echo "Example: $0 test@example.com password123"
    exit 1
fi

EMAIL=$1
PASSWORD=$2
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

echo "Creating user: $EMAIL"

# Step 1: Create the user
RESPONSE=$(curl -s -X POST 'http://127.0.0.1:55321/auth/v1/signup' \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Extract user ID from response
USER_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
    echo "❌ Failed to create user. Response:"
    echo $RESPONSE
    exit 1
fi

echo "✅ User created with ID: $USER_ID"

# Step 2: Confirm the user's email
echo "Confirming user email..."
CONFIRM_RESPONSE=$(curl -s -X PUT "http://127.0.0.1:55321/auth/v1/admin/users/$USER_ID" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email_confirm": true
  }')

echo "✅ User email confirmed!"

# Step 3: Test sign in
echo "Testing sign in..."
SIGNIN_RESPONSE=$(curl -s -X POST 'http://127.0.0.1:55321/auth/v1/token?grant_type=password' \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if echo $SIGNIN_RESPONSE | grep -q "access_token"; then
    echo "✅ Sign in successful!"
    echo ""
    echo "🎉 Test user ready to use:"
    echo "   Email: $EMAIL"
    echo "   Password: $PASSWORD"
    echo ""
    echo "You can now sign in at: http://localhost:3000/auth/signin"
else
    echo "❌ Sign in failed. Response:"
    echo $SIGNIN_RESPONSE
fi
