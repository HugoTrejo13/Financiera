#!/bin/bash

echo "🚀 Iniciando servicios de Financiera..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Iniciar Backend
echo -e "${BLUE}📦 Iniciando Backend (FastAPI)...${NC}"
cd backend
python3 -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Esperar un momento para que el backend inicie
sleep 2

# Iniciar Frontend (ya está corriendo en el puerto 5176)
echo -e "${GREEN}✅ Backend corriendo en http://localhost:8000${NC}"
echo -e "${GREEN}✅ Frontend corriendo en http://localhost:5176${NC}"
echo ""
echo "📊 Documentación API: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"

# Esperar a que el usuario presione Ctrl+C
wait $BACKEND_PID

# Made with Bob
