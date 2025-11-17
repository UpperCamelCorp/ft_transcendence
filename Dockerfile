FROM node:24

# Répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour utiliser le cache Docker
COPY package*.json ./

# Installer les dépendances et compiler les modules natifs
RUN npm install

# Copier le reste du projet
COPY . .

# Build TypeScript and Tailwind CSS
RUN npm run build

# Exposer le port
EXPOSE 3000

COPY ./scripts/node_script.sh /node_script.sh
RUN chmod +x /node_script.sh

CMD ["/node_script.sh"]
