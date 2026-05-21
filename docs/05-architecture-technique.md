# Phase 5 — Conception technique

## Architecture globale

MediBook utilise une architecture fullstack découplée.

Architecture :

Utilisateur
→ Frontend Next.js
→ API REST
→ Backend Node.js / Express.js
→ Prisma ORM
→ Base de données PostgreSQL

## Frontend

Le frontend est développé avec Next.js.

Pages principales :

- / : page d’accueil
- /doctors : liste des médecins
- /login : connexion
- /register : inscription
- /dashboard : tableau de bord utilisateur
- /appointments/new : réservation d’un rendez-vous

## Backend

Le backend est développé avec Node.js et Express.js.

Il est organisé en plusieurs couches :

- routes : définition des endpoints API
- controllers : logique de traitement des requêtes
- middlewares : authentification et autorisation
- validators : validation des données avec Zod
- config : configuration Prisma

## Base de données

La base de données utilisée est PostgreSQL.

L’accès aux données est géré avec Prisma ORM.

Les principales entités sont :

- User
- DoctorProfile
- Appointment

## Sécurité

Mesures de sécurité mises en place :

- mots de passe hashés avec bcryptjs
- authentification avec JWT
- routes privées protégées par middleware
- contrôle des rôles PATIENT, DOCTOR et ADMIN côté backend
- validation des données avec Zod

## Docker

L’application est dockerisée avec trois services :

- frontend : application Next.js
- backend : API Express.js
- postgres : base de données PostgreSQL

Le projet peut être lancé avec :

docker compose up --build

## CI/CD

Le projet utilise GitHub Actions.

Le pipeline exécute automatiquement :

- installation des dépendances
- génération Prisma
- migrations Prisma
- tests backend
- couverture de tests
- build frontend
- build Docker backend
- build Docker frontend
