# Dockerfile (backend)
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .
ENV FLASK_ENV=production
EXPOSE 5000
# use eventlet worker for Flask-SocketIO
CMD ["gunicorn", "-k", "eventlet", "-w", "1", "wsgi:app", "--bind", "0.0.0.0:5000"]
