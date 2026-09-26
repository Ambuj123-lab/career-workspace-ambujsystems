FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Security: non-root user
RUN useradd -m -u 1001 mcpuser && chown -R mcpuser:mcpuser /app
USER mcpuser

EXPOSE 8000

CMD ["python", "server.py"]
