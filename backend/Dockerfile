FROM python:3.13-slim

WORKDIR /app

# Install build dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads/resume

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Run migrations (and optional seed) before starting Uvicorn
ENTRYPOINT ["./entrypoint.sh"]
