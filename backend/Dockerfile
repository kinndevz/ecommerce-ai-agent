# 1. Base Image
FROM python:3.10-slim

# 2. Config môi trường
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Tạo thư mục làm việc
WORKDIR /app

# 4. Cài thư viện hệ thống (để cài driver PostgreSQL)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Copy file requirements và cài thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy toàn bộ code vào container (bao gồm folder app, scripts...)
COPY . .

# 7. Mở port
EXPOSE 8000

# 8. LỆNH CHẠY SERVER (Quan trọng)
# Chúng ta không chạy "python run.py"
# Mà chạy uvicorn trỏ thẳng vào app.main
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]