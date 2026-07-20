# Use official Python 3.11 slim image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies, Google Chrome stable, and curl
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    unzip \
    wget \
    xvfb \
    libxi6 \
    libgconf-2-4 \
    --no-install-recommends \
    && curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y \
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependency configurations
COPY automation/requirements.txt /app/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

# Copy automation framework files into the container
COPY automation/ /app/

# Make sure entrypoint script has execution permissions
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Declare mounted reports volume
VOLUME [ "/app/reports" ]

# Set default runner entrypoint
ENTRYPOINT [ "/app/entrypoint.sh" ]
