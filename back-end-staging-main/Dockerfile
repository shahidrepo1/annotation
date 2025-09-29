# ================================
# 1) Base image
# ================================
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Set workdir to /app (NOT inside annotation_project)
WORKDIR /app

# ================================
# 2) Install system dependencies
# ================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    ffmpeg \
  && rm -rf /var/lib/apt/lists/*

# ================================
# 3) Install Python dependencies
# ================================
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# ================================
# 4) Copy project files
# ================================
COPY . /app/

# ================================
# 5) Run Django with Gunicorn
# ================================
EXPOSE 8000
CMD ["gunicorn", "annotation_project.wsgi:application", "--bind", "0.0.0.0:8000"]
