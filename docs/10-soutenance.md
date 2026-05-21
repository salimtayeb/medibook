# Phase 12 — Soutenance finale

## 1. Présentation métier

MediBook est une plateforme web de réservation de rendez-vous médicaux.

Elle permet aux patients de consulter des médecins disponibles, de créer un compte, de se connecter, de réserver un rendez-vous et d’annuler un rendez-vous depuis un tableau de bord.

## 2. Problématique

La prise de rendez-vous médicaux peut être longue et peu centralisée.

Les patients doivent souvent contacter plusieurs cabinets pour trouver un créneau disponible.

MediBook propose une solution simple et centralisée pour faciliter cette prise de rendez-vous.

## 3. Utilisateurs

L’application contient trois rôles :

- Patient
- Médecin
- Administrateur

## 4. Fonctionnalités principales

- Inscription
- Connexion avec JWT
- Consultation des médecins
- Réservation de rendez-vous
- Tableau de bord patient
- Annulation de rendez-vous
- Gestion des rôles
- Protection des routes privées

## 5. Architecture technique

Le projet utilise une architecture fullstack découplée :

Frontend Next.js
→ Backend Node.js / Express.js
→ Prisma ORM
→ PostgreSQL

## 6. Sécurité

La sécurité repose sur :

- hash des mots de passe avec bcryptjs
- authentification avec JWT
- middleware de protection des routes
- contrôle des rôles PATIENT, DOCTOR et ADMIN
- validation des données avec Zod

## 7. Tests

Le backend est testé avec Jest et Supertest.

Résultat :

- 43 tests passés
- couverture backend de 100%

Le frontend possède également un test E2E avec Playwright.

## 8. Docker

L’application est dockerisée avec Docker Compose.

Services :

- frontend
- backend
- postgres

Commande :

docker compose up --build

## 9. CI/CD

GitHub Actions exécute automatiquement :

- tests backend
- tests E2E frontend
- build frontend
- build Docker backend
- build Docker frontend

Le workflow GitHub Actions est passé avec succès.

## 10. Déploiement

Frontend Vercel :

https://medibook-frontend-red.vercel.app

Backend Render :

https://medibook-backend-g0f1.onrender.com

## 11. Difficultés rencontrées

- configuration Docker avec frontend, backend et PostgreSQL
- connexion entre frontend Docker et backend Docker
- correction de la couverture de tests jusqu’à 100%
- configuration de Render avec PostgreSQL
- configuration de Vercel avec l’URL du backend

## 12. Solutions apportées

- utilisation de Docker Compose
- ajout de variables d’environnement adaptées
- ajout de tests d’intégration et de cas limites
- utilisation de Prisma migrate deploy
- configuration de GitHub Actions

## 13. Améliorations possibles

- interface complète pour les médecins
- interface complète pour les administrateurs
- gestion avancée des disponibilités
- notifications email
- documentation Swagger
- monitoring et logs
