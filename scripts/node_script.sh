#!/bin/sh

if [ ! -d /app/public/uploads ]; then
    mkdir -p /app/public/uploads
fi

if [ ! -f /app/certs/cert.pem ]; then
    echo "Generating SSL certificates..."
    mkdir -p /app/certs
    openssl req -x509 -newkey rsa:4096 -nodes \
        -keyout /app/certs/key.pem \
        -out /app/certs/cert.pem \
        -days 365 \
        -subj "/C=FR/ST=State/L=City/O=UUC/CN=${SERVER_NAME:-localhost}"
fi

exec npm run run