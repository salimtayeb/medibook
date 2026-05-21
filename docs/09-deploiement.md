# Phase 10 — Déploiement

## Objectif

L’objectif du déploiement est de rendre l’application MediBook accessible publiquement en ligne.

Le projet est déployé avec deux plateformes :

- Vercel pour le frontend Next.js
- Render pour le backend Express.js et la base PostgreSQL

## Frontend

Le frontend est déployé sur Vercel.

URL publique :

https://medibook-frontend-red.vercel.app

Le frontend communique avec le backend grâce à la variable d’environnement :

NEXT_PUBLIC_API_URL=https://medibook-backend-g0f1.onrender.com

## Backend

Le backend est déployé sur Render.

URL publique :

https://medibook-backend-g0f1.onrender.com

Routes de vérification :

https://medibook-backend-g0f1.onrender.com

https://medibook-backend-g0f1.onrender.com/api/health

https://medibook-backend-g0f1.onrender.com/api/doctors

## Base de données

La base de données PostgreSQL est hébergée sur Render.

Le backend utilise la variable d’environnement DATABASE_URL pour se connecter à la base.

## Commandes Render

Build Command :

npm install && npx prisma generate

Start Command :

npx prisma migrate deploy && node prisma/seed.js && npm start

## Variables d’environnement Render

- DATABASE_URL
- PORT
- JWT_SECRET

## Variables d’environnement Vercel

- NEXT_PUBLIC_API_URL

## Vérification du déploiement

Le déploiement est validé si :

- le frontend est accessible publiquement
- le backend répond sur /api/health
- la page /doctors affiche les médecins
- l’inscription fonctionne
- la connexion fonctionne
- la réservation de rendez-vous fonctionne
