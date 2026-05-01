FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libdlib-dev \
    libboost-all-dev \
    libgtk-3-dev \
    libpq-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Default command (override in docker-compose)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
