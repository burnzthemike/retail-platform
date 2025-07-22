#!/bin/bash
echo "🚀 Setting up your Retail Platform..."
echo ""

# Install all dependencies
echo "📦 Installing dependencies..."
npm install
npm run install:all

# Setup database
echo "🗄️ Setting up database..."
npm run setup:db

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. npm run dev"
echo "2. Open http://localhost:3000"
echo ""
echo "Login: admin@retail.com / admin123"
