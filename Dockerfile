# Base : Node 18 Alpine
FROM node:20-alpine

# Installer les dépendances système nécessaires pour compiler sqlite3
RUN apk add --no-cache python3 make g++ git bash

# Répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour utiliser le cache Docker
COPY package*.json ./

# Installer les dépendances et compiler les modules natifs
RUN npm install

# Copier le reste du projet
COPY . .

# Exposer le port
EXPOSE 3000

# Commande par défaut pour le dev
CMD ["npm", "run", "dev"]
