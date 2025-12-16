# 1. Base Image: Use Python 3.10 slim for a smaller footprint
FROM python:3.10-slim

# 2. Environment Configuration
# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
# Ensure stdout/stderr are flushed immediately
ENV PYTHONUNBUFFERED=1

# 3. Set Working Directory
WORKDIR /app

# 4. System Dependencies
# Install GCC and PostgreSQL development libraries required for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Python Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Application Source Code
COPY . .

# 7. Expose Application Port
EXPOSE 8000

# 8. Entrypoint
# Run Uvicorn directly for production performance
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]