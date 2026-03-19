
# Guide d'exécution - Application SOAP avec PostgreSQL sur Windows

## 1. Démarrage de PostgreSQL

# Démarrer le service PostgreSQL (ajuster la version)
net start postgresql-x64-16


## 2. Création de la base de données
```cmd
# Se connecter à PostgreSQL
psql -U postgres




Dans l'invite psql :


CREATE DATABASE mydb;
CREATE USER "user" WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mydb TO "user";
\q
```
password
## 3. Initialisation de la table
```cmd
psql -U postgres -d mydb -f init.sql
```

## 4. Installation des dépendances
```cmd
npm init -y
npm install soap postgres
```

## 5. Lancement du serveur
```cmd
node server.js
```
*(Le serveur tourne sur http://localhost:8000/products?wsdl)*

## 6. Lancement du client (nouvelle fenêtre)
```cmd
node client.js
```

## Commandes utiles
```cmd
# Arrêter PostgreSQL
net stop postgresql-x64-16

# Tester le serveur SOAP
curl http://localhost:8000/products?wsdl

# Ou avec PowerShell
Invoke-WebRequest -Uri http://localhost:8000/products?wsdl

# Vérifier les processus sur le port 8000
netstat -ano | findstr :8000
```

## Résolution des problèmes
- **"psql non reconnu"** : `set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin`
- **Port 8000 occupé** : `taskkill /PID [PID] /F`
```
```