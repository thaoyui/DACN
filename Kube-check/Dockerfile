# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies required for pdfkit/weasyprint (if needed later)
# and basic tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY src/ ./src/
COPY config/ ./config/
COPY templates/ ./templates/

# Create reports directory
RUN mkdir -p reports

# Set entrypoint to python
ENTRYPOINT ["python", "src/main.py"]

# Default command (can be overridden)
CMD ["--help"]
