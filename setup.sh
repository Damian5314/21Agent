#!/bin/bash

echo "🚀 21Agent Setup Script"
echo "========================"

# Controleer of Node.js is geïnstalleerd
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is niet geïnstalleerd. Installeer Node.js eerst."
    exit 1
fi

echo "✅ Node.js versie: $(node --version)"

# Installeer root dependencies
echo "📦 Installeren van root dependencies..."
npm install

# Installeer frontend dependencies
echo "📦 Installeren van frontend dependencies..."
cd frontend && npm install && cd ..

# Installeer backend dependencies  
echo "📦 Installeren van backend dependencies..."
cd backend && npm install && cd ..

# Maak .env bestand aan als het niet bestaat
if [ ! -f backend/.env ]; then
    echo "⚙️  Maken van .env bestand..."
    cp backend/.env.example backend/.env
    echo "⚠️  Vergeet niet om je Google Gemini API key in te vullen in backend/.env"
fi

echo ""
echo "✅ Setup voltooid!"
echo ""
echo "🔧 Volgende stappen:"
echo "1. Vul je Google Gemini API key in: backend/.env"
echo "2. Start de applicatie: npm run dev"
echo ""
echo "📖 Meer informatie:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- Health check: http://localhost:3001/health"