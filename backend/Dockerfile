FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema requeridas para compilar librerías (bcrypt, asyncpg)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para aprovechar caché de capas
COPY requirements.txt .

# Instalar dependencias de Python + bcrypt puro
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install bcrypt==4.1.2

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 8000

# Arrancar Uvicorn enlazado a 0.0.0.0
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
