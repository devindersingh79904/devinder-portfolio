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

# Create a non-root user and give it ownership of the app (incl. uploads).
# NOTE: when bind-mounting ./backend/uploads on Linux, ensure the host directory
# is writable by uid 1000 (e.g. `chmod -R 777 backend/uploads`) or use a named volume.
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run migrations (and optional seed) before starting Uvicorn
ENTRYPOINT ["./entrypoint.sh"]
