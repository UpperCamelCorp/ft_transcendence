#!/bin/sh

if [ ! -f /app/certs/cert.pem ]; then
    echo "Generating SSL certificates..."
    mkdir -p /app/certs
    openssl req -x509 -newkey rsa:4096 -nodes \
        -keyout /app/certs/key.pem \
        -out /app/certs/cert.pem \
        -days 365 \
        -subj "/C=FR/ST=State/L=City/O=UUC/CN=transcendence"
fi

exec npm run run