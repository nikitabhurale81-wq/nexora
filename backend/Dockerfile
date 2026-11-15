# ==========================================================================
# NEXORA AI Backend — Production Dockerfile
# Multi-stage build: smaller image, no dev dependencies in production
# ==========================================================================

# --------------------------------------------------------------------------
# Stage 1: Builder — install dependencies
# --------------------------------------------------------------------------
FROM python:3.12-slim AS builder

# Dont write .pyc files, dont buffer logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies needed to build some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (layer caching — faster rebuilds)
COPY requirements.txt .

# Install Python dependencies into a separate folder
RUN pip install --upgrade pip && \
    pip install --prefix=/install -r requirements.txt

# --------------------------------------------------------------------------
# Stage 2: Runtime — lean final image
# --------------------------------------------------------------------------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # App config
    APP_ENV=production \
    PORT=8000

WORKDIR /app

# Install only runtime system libs (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user (security best practice)
RUN groupadd -r nexora && useradd -r -g nexora -d /app nexora

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application code
COPY --chown=nexora:nexora . .

# Switch to non-root user
USER nexora

# Expose port
EXPOSE ${PORT}

# Health check — Docker will restart container if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

# Start server
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
