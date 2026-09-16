<<<<<<< HEAD
# booking-app
=======
# Le Fauteuil — Backend Stripe

Backend Node.js/Express pour gérer les acomptes Stripe et les rendez-vous.

## Prérequis
- Node.js 18 ou plus
- npm
- Un compte Stripe avec une clé API de test
- Optionnel : Stripe CLI pour tester les webhooks localement

Vérifie l’installation :
```bash
node -v
npm -v
```

## 1. Ouvrir le projet
Ouvre le dossier du projet dans VS Code.

## 2. Installer les dépendances
Dans le terminal du projet :
```bash
npm install
```

## 3. Configurer les variables d’environnement
Crée un fichier `.env` à la racine du projet.

Contenu attendu :
```env
STRIPE_SECRET_KEY=sk_test_votre_cle_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
FRONTEND_URL=http://localhost:5500
PORT=4000
```

Important :
- `STRIPE_SECRET_KEY` vient du dashboard Stripe > Developers > API keys
- `STRIPE_WEBHOOK_SECRET` vient de Stripe Dashboard > Developers > Webhooks
- `.env` est ignoré par Git grâce au `.gitignore`

## 4. Lancer le serveur
```bash
npm start
```

Le serveur doit afficher :
```bash
Serveur lancé sur le port 4000
```

## 5. Tester les webhooks localement
Installe la Stripe CLI, puis ouvre un second terminal :
```bash
stripe listen --forward-to localhost:4000/webhook
```

La commande affiche un secret de type :
```bash
whsec_...
```

Copie ce secret dans `.env` en le mettant dans `STRIPE_WEBHOOK_SECRET`.

## 6. Routes disponibles
- `POST /create-checkout-session` : crée une session Stripe
- `POST /webhook` : reçoit les événements Stripe
- `GET /appointments` : liste les rendez-vous
- `GET /session-status` : vérifie le statut d’une session

## 7. Mettre le projet sur GitHub
Si le dépôt n’existe pas encore :
```bash
git init
git add .
git commit -m "Initial commit"
```

Ensuite, ajoute ton vrai dépôt GitHub :
```bash
git branch -M main
git remote add origin https://github.com/VOTRE-NOM/VOTRE-DEPOT.git
git push -u origin main
```

Remplace bien :
- `VOTRE-NOM` par ton pseudo GitHub
- `VOTRE-DEPOT` par le nom de ton dépôt

Exemple :
```bash
git remote add origin https://github.com/williamvente434/booking-app.git
```

## 8. Fichiers ignorés
Le fichier `.gitignore` contient déjà :
```gitignore
node_modules/
.env
appointments.db
*.log
```

Cela évite d’envoyer les clés secrètes et les fichiers sensibles sur GitHub.

## 9. Brancher le frontend
Dans le front, remplace le paiement simulé par les appels vers ton backend local, par exemple :
```js
http://localhost:4000
```

## 10. Points de vigilance
- Ne jamais publier `.env` sur GitHub
- Utiliser des clés Stripe de test en local
- Vérifier que le webhook Stripe pointe bien vers `localhost:4000/webhook`

## 11. Commandes utiles
```bash
git status
git add .
git commit -m "Mon message"
git push -u origin main
```

## 12. Résumé rapide
1. Installer les dépendances
2. Créer `.env`
3. Lancer `npm start`
4. Tester le webhook Stripe
5. Pousser le projet sur GitHub
>>>>>>> 8ca8af3 (Initial commit)
