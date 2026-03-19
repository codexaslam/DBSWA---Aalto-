FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run uvicorn on the default HTTP port (FastAPI usually runs on 8000, 
# but if the course doesn't specify, standard uvicorn container port 8000 is safe)
CMD ["uvicorn", "app:server", "--host", "0.0.0.0", "--port", "8000"]