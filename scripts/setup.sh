#!/bin/bash

# Setup script for the Asset Monitor POC
# This script sets up the development environment and runs the initial database setup

set -e

echo "🚀 Setting up Asset Monitor POC..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Supabase environment variables are not set."
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ Environment variables check passed"

# Install dependencies
echo "📦 Installing dependencies..."
if [ -f yarn.lock ]; then
    yarn install
elif [ -f package-lock.json ]; then
    npm install
elif [ -f pnpm-lock.yaml ]; then
    pnpm install
else
    echo "❌ No lockfile found. Please run npm install, yarn install, or pnpm install first."
    exit 1
fi

echo "✅ Dependencies installed"

# Run database setup scripts
echo "🗄️  Setting up database schema..."

# Note: In a real deployment, you would run these against your Supabase instance
# For this POC, we assume the scripts have been run via the Supabase dashboard or CLI

echo "📋 Database setup scripts are available in the scripts/ directory:"
echo "  - 001_create_schema.sql"
echo "  - 002_create_user_roles.sql" 
echo "  - 003_create_rls_policies.sql"
echo "  - 004_seed_data.sql"
echo "  - 005_create_admin_user.sql"

echo "🔧 Please run these scripts in your Supabase dashboard or using the Supabase CLI"

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run the database scripts in your Supabase instance"
echo "2. Create a user account and promote to admin using: SELECT public.promote_user_to_admin('your-email@example.com');"
echo "3. Start the development server: npm run dev"
echo "4. (Optional) Start the mock data generator: npm run mock-data"
echo ""
echo "🐳 For Docker deployment:"
echo "1. Copy .env.example to .env.local and fill in your Supabase credentials"
echo "2. Run: docker-compose up --build"
