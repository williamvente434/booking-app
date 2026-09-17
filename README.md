# Le Fauteuil — Backend Stripe

## 1. Prérequis
- Installer Node.js (version 18 ou plus) : https://nodejs.org (choisis "LTS")
- Vérifier l'installation dans un terminal : `node -v` et `npm -v` doivent afficher un numéro de version

## 2. Ouvrir le projet dans VSCode
- Décompresse ce dossier `stripe-backend`
- Dans VSCode : Fichier > Ouvrir le dossier > sélectionne `stripe-backend`
- Ouvre un terminal intégré : Terminal > Nouveau terminal

## 3. Configurer les clés
- Renomme `.env.example` en `.env`
- Ouvre `.env` et colle tes vraies clés Stripe (Dashboard Stripe > Developers > API keys)
- Ne mets JAMAIS ce fichier `.env` sur Git (le `.gitignore` fourni s'en occupe déjà)

## 4. Installer les dépendances
Dans le terminal VSCode :
```
npm install
```
Ça lit le fichier `package.json` et télécharge tout ce dont le serveur a besoin dans un dossier `node_modules` (à ne jamais committer non plus).

## 5. Lancer le serveur
```
npm start
```
Tu dois voir : `Serveur lancé sur le port 4000`

## 6. Tester le webhook en local
Installe la CLI Stripe (https://stripe.com/docs/stripe-cli), puis dans un DEUXIÈME terminal :
```
stripe listen --forward-to localhost:4000/webhook
```
Elle t'affiche un `whsec_...` à coller dans ton `.env`.

## 7. Mettre sur GitHub
```
git init
git add .
git commit -m "Backend Stripe initial"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/TON-REPO.git
git push -u origin main
```
Comme `.env` est dans `.gitignore`, tes clés secrètes ne partiront jamais sur GitHub.

## 8. Brancher le frontend
Dans `booking-app.html`, remplace le paiement simulé par le code de `frontend-change.js`, en changeant l'URL par celle de ton backend (en local : `http://localhost:4000`).
