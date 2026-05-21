# MediBook

MediBook est une application web fullstack moderne permettant la réservation de rendez-vous médicaux en ligne.

Le projet a été réalisé dans le cadre d’un atelier fullstack dont l’objectif est de concevoir, développer, tester, dockeriser, documenter et industrialiser une application web complète avec une architecture frontend/backend découplée.

## Sommaire

- [Présentation du projet](#présentation-du-projet)
- [Problématique](#problématique)
- [Objectifs](#objectifs)
- [Utilisateurs](#utilisateurs)
- [Fonctionnalités réalisées](#fonctionnalités-réalisées)
- [Technologies utilisées](#technologies-utilisées)
- [Architecture globale](#architecture-globale)
- [Structure du projet](#structure-du-projet)
- [Modèle de données](#modèle-de-données)
- [Endpoints API](#endpoints-api)
- [Installation locale](#installation-locale)
- [Lancement avec Docker](#lancement-avec-docker)
- [Variables d’environnement](#variables-denvironnement)
- [Tests](#tests)
- [CI/CD avec GitHub Actions](#cicd-avec-github-actions)
- [Comptes de test](#comptes-de-test)
- [Sécurité](#sécurité)
- [Déploiement](#déploiement)
- [Améliorations possibles](#améliorations-possibles)
- [Auteur](#auteur)

---

## Présentation du projet

MediBook est une plateforme de réservation de rendez-vous médicaux.

Elle permet à un patient de créer un compte, se connecter, consulter les médecins disponibles, réserver un rendez-vous, consulter ses rendez-vous depuis son tableau de bord et annuler un rendez-vous.

Le projet repose sur une architecture fullstack moderne composée :

- d’un frontend développé avec Next.js ;
- d’un backend développé avec Node.js et Express.js ;
- d’une base de données PostgreSQL ;
- d’un ORM Prisma ;
- d’une authentification sécurisée par JWT ;
- d’une dockerisation complète avec Docker Compose ;
- d’un pipeline CI avec GitHub Actions ;
- d’une suite de tests backend avec une couverture de 100%.

---

## Problématique

La prise de rendez-vous médicaux est souvent longue et peu centralisée.

Les patients doivent généralement contacter plusieurs cabinets pour connaître les disponibilités, tandis que les médecins doivent gérer manuellement leurs créneaux et leurs rendez-vous.

MediBook répond à cette problématique en proposant une plateforme simple, centralisée et accessible en ligne.

---

## Objectifs

Les objectifs principaux du projet sont :

- permettre aux patients de réserver facilement un rendez-vous médical ;
- permettre l’accès à une liste de médecins disponibles ;
- sécuriser l’accès aux fonctionnalités grâce à l’authentification JWT ;
- gérer plusieurs rôles utilisateurs ;
- construire une API REST claire et testée ;
- connecter l’application à une base PostgreSQL ;
- dockeriser l’ensemble de l’application ;
- automatiser les tests et les builds avec GitHub Actions.

---

## Utilisateurs

L’application gère trois rôles principaux.

### Patient

Le patient peut :

- créer un compte ;
- se connecter ;
- consulter les médecins ;
- réserver un rendez-vous ;
- consulter ses rendez-vous ;
- annuler un rendez-vous.

### Médecin

Le médecin peut :

- se connecter ;
- accéder à ses rendez-vous côté backend ;
- être associé à un profil médical ;
- être consulté par les patients dans la liste des médecins.

### Administrateur

L’administrateur peut :

- accéder aux routes protégées réservées aux admins ;
- consulter l’ensemble des rendez-vous côté backend ;
- superviser les données de la plateforme.

---

## Fonctionnalités réalisées

### Authentification

- Inscription d’un patient
- Connexion utilisateur
- Génération d’un token JWT
- Route `/api/auth/me` pour récupérer l’utilisateur connecté
- Protection des routes privées
- Gestion des rôles avec middleware d’autorisation

### Médecins

- Création de médecins via seed Prisma
- Liste des médecins disponibles
- Affichage des informations principales :
  - nom ;
  - spécialité ;
  - ville ;
  - description ;
  - prix.

### Rendez-vous

- Réservation d’un rendez-vous par un patient connecté
- Vérification des conflits de créneaux
- Affichage des rendez-vous de l’utilisateur connecté
- Annulation d’un rendez-vous
- Gestion des statuts :
  - `PENDING`
  - `CONFIRMED`
  - `CANCELLED`
  - `COMPLETED`

### Frontend

- Page d’accueil
- Page de liste des médecins
- Page de connexion
- Page d’inscription
- Tableau de bord patient
- Page de réservation
- Bouton d’annulation de rendez-vous
- Interface responsive simple

### Backend

- API REST avec Express.js
- Architecture organisée en couches :
  - routes ;
  - controllers ;
  - middlewares ;
  - validators ;
  - config.
- Validation des données avec Zod
- Gestion des erreurs HTTP
- Sécurisation des routes avec JWT
- Accès base de données avec Prisma

### DevOps

- Dockerfile backend
- Dockerfile frontend
- Docker Compose avec :
  - frontend ;
  - backend ;
  - PostgreSQL.
- GitHub Actions avec :
  - installation des dépendances ;
  - génération Prisma ;
  - migrations ;
  - tests backend ;
  - build frontend ;
  - build Docker backend ;
  - build Docker frontend.

---

## Technologies utilisées

### Frontend

- Next.js
- React
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- Prisma
- JWT
- bcryptjs
- Zod
- dotenv
- cors

### Base de données

- PostgreSQL

### Tests

- Jest
- Supertest
- Playwright

### DevOps

- Docker
- Docker Compose
- GitHub Actions

### Gestion du code

- Git
- GitHub

---

## Architecture globale

```txt
Utilisateur
   |
   v
Frontend Next.js
   |
   | Requêtes HTTP / API REST
   v
Backend Node.js / Express.js
   |
   | Prisma ORM
   v
Base de données PostgreSQL
```

Architecture Docker :

```txt
docker-compose.yml
   |
   |-- frontend  : Next.js sur le port 3000
   |-- backend   : Express.js sur le port 5000
   |-- postgres  : PostgreSQL sur le port 5432
```

---

## Structure du projet

```txt
medibook/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── appointment.controller.js
│   │   │   ├── auth.controller.js
│   │   │   └── doctor.controller.js
│   │   │
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── appointment.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── doctor.routes.js
│   │   │
│   │   ├── validators/
│   │   │   ├── appointment.validator.js
│   │   │   └── auth.validator.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   │   ├── app.test.js
│   │   ├── edge-cases.test.js
│   │   └── integration.test.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── frontend/
│   ├── src/app/
│   │   ├── appointments/new/
│   │   ├── dashboard/
│   │   ├── doctors/
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── README.md
└── docs/
```

---

## Modèle de données

Le modèle de données est défini avec Prisma.

### User

Représente un utilisateur de l’application.

Champs principaux :

- `id`
- `email`
- `password`
- `firstName`
- `lastName`
- `role`
- `createdAt`
- `updatedAt`

Rôles possibles :

- `PATIENT`
- `DOCTOR`
- `ADMIN`

### DoctorProfile

Représente le profil professionnel d’un médecin.

Champs principaux :

- `id`
- `userId`
- `specialty`
- `city`
- `description`
- `price`
- `createdAt`
- `updatedAt`

Relations :

- un `DoctorProfile` appartient à un `User`
- un `DoctorProfile` peut avoir plusieurs rendez-vous

### Appointment

Représente un rendez-vous médical.

Champs principaux :

- `id`
- `patientId`
- `doctorId`
- `startAt`
- `endAt`
- `reason`
- `status`
- `createdAt`
- `updatedAt`

Statuts possibles :

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`

Relations :

- un rendez-vous appartient à un patient ;
- un rendez-vous appartient à un médecin.

---

## Endpoints API

### Santé de l’API

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/` | Message d’accueil de l’API |
| GET | `/api/health` | Vérifie que l’API fonctionne |
| GET | `/api/db-check` | Vérifie la connexion à PostgreSQL |

### Authentification

| Méthode | Endpoint | Protection | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Créer un compte patient |
| POST | `/api/auth/login` | Public | Se connecter |
| GET | `/api/auth/me` | JWT | Récupérer l’utilisateur connecté |
| GET | `/api/auth/admin-test` | JWT + ADMIN | Tester une route admin |

Exemple de body pour l’inscription :

```json
{
  "email": "patient@test.com",
  "password": "password123",
  "firstName": "Ali",
  "lastName": "Benali"
}
```

Exemple de body pour la connexion :

```json
{
  "email": "patient@test.com",
  "password": "password123"
}
```

### Médecins

| Méthode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/api/doctors` | Public | Récupérer la liste des médecins |

### Rendez-vous

| Méthode | Endpoint | Protection | Description |
|---|---|---|---|
| POST | `/api/appointments` | JWT + PATIENT | Réserver un rendez-vous |
| GET | `/api/appointments/me` | JWT | Récupérer ses rendez-vous |
| PATCH | `/api/appointments/:id/cancel` | JWT | Annuler un rendez-vous |

Exemple de body pour créer un rendez-vous :

```json
{
  "doctorId": "doctor-profile-id",
  "startAt": "2030-05-20T10:00:00.000Z",
  "endAt": "2030-05-20T10:30:00.000Z",
  "reason": "Consultation médicale générale"
}
```

---

## Installation locale

### Prérequis

- Node.js
- npm
- Git
- Docker Desktop
- PostgreSQL ou Docker

### 1. Cloner le repository

```bash
git clone https://github.com/salimtayeb/medibook.git
cd medibook
```

### 2. Installer le backend

```bash
cd backend
npm install
```

Créer un fichier `.env` dans le dossier `backend` :

```env
PORT=5000
JWT_SECRET=medibook_super_secret_key
DATABASE_URL="postgresql://medibook_user:medibook_password@localhost:5432/medibook_db?schema=public"
```

Générer Prisma :

```bash
npx prisma generate
```

Lancer les migrations :

```bash
npx prisma migrate dev
```

Ajouter les données de test :

```bash
node prisma/seed.js
```

Lancer le backend :

```bash
npm run dev
```

Backend disponible sur :

```txt
http://localhost:5000
```

### 3. Installer le frontend

Dans un autre terminal :

```bash
cd frontend
npm install
```

Créer un fichier `.env.local` dans le dossier `frontend` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Lancer le frontend :

```bash
npm run dev
```

Frontend disponible sur :

```txt
http://localhost:3000
```

---

## Lancement avec Docker

Le projet peut être lancé entièrement avec Docker Compose.

À la racine du projet :

```bash
docker compose up --build
```

Services lancés :

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:5000` |
| PostgreSQL | `localhost:5432` |

Vérifier le backend :

```bash
curl http://localhost:5000/api/health
```

Vérifier la connexion base de données :

```bash
curl http://localhost:5000/api/db-check
```

Arrêter les conteneurs :

```bash
docker compose down
```

---

## Variables d’environnement

### Backend

| Variable | Exemple | Description |
|---|---|---|
| `PORT` | `5000` | Port du serveur Express |
| `JWT_SECRET` | `medibook_super_secret_key` | Clé utilisée pour signer les tokens JWT |
| `DATABASE_URL` | `postgresql://...` | URL de connexion PostgreSQL |

### Frontend

| Variable | Exemple | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | URL publique du backend |
| `SERVER_API_URL` | `http://backend:5000` | URL interne Docker utilisée côté serveur |

---

## Tests

Les tests backend sont réalisés avec Jest et Supertest.

Les tests E2E frontend sont réalisés avec Playwright.

Ils couvrent :

- routes publiques ;
- authentification ;
- inscription ;
- connexion ;
- erreurs de validation ;
- token manquant ;
- token invalide ;
- rôles utilisateurs ;
- liste des médecins ;
- création de rendez-vous ;
- conflits de créneaux ;
- récupération des rendez-vous ;
- annulation ;
- erreurs serveur ;
- cas limites.

Lancer les tests backend :

```bash
cd backend
npm test
```

Lancer les tests backend avec couverture :

```bash
npm test -- --coverage
```

Résultat obtenu :

```txt
All files        | 100 | 100 | 100 | 100
Test Suites      | 3 passed
Tests            | 43 passed
```

Lancer les tests E2E frontend :

```bash
cd frontend
npm run e2e
```

Couverture backend :

| Type | Couverture |
|---|---|
| Statements | 100% |
| Branches | 100% |
| Functions | 100% |
| Lines | 100% |

---

## CI/CD avec GitHub Actions

Le projet utilise GitHub Actions pour exécuter automatiquement les vérifications à chaque push sur la branche `main`.

Le workflow se trouve ici :

```txt
.github/workflows/ci.yml
```

Le pipeline exécute :

- installation des dépendances backend ;
- génération du client Prisma ;
- migrations Prisma ;
- tests backend avec couverture ;
- installation des dépendances frontend ;
- build du frontend ;
- build Docker backend ;
- build Docker frontend.

Le dernier workflow GitHub Actions est passé avec succès.

---

## Comptes de test

Après exécution du seed, les comptes suivants sont disponibles.

### Patient

```txt
Email : patient@test.com
Mot de passe : password123
```

### Administrateur

```txt
Email : admin@medibook.com
Mot de passe : password123
```

### Médecin 1

```txt
Email : doctor1@medibook.com
Mot de passe : password123
Spécialité : Cardiologie
Ville : Paris
```

### Médecin 2

```txt
Email : doctor2@medibook.com
Mot de passe : password123
Spécialité : Médecine générale
Ville : Lyon
```

---

## Sécurité

Mesures mises en place :

- mots de passe hashés avec bcryptjs ;
- authentification avec JWT ;
- routes privées protégées par middleware ;
- contrôle des rôles avec middleware d’autorisation ;
- validation des entrées avec Zod ;
- erreurs HTTP adaptées ;
- exclusion du fichier `.env` via `.gitignore`.

---

## Déploiement

Le déploiement public reste à compléter.

Liens prévus :

| Élément | Plateforme | Lien |
|---|---|---|
| Frontend | Vercel | https://medibook-frontend-red.vercel.app |
| Backend | Render | https://medibook-backend-g0f1.onrender.com |
| Repository | GitHub | https://github.com/salimtayeb/medibook |

---

## Améliorations possibles

Améliorations futures possibles :

- interface médecin complète ;
- interface administrateur complète ;
- confirmation ou refus des rendez-vous par le médecin ;
- gestion avancée des disponibilités ;
- notifications email ;
- documentation Swagger/OpenAPI ;
- tests E2E avec Playwright ;
- monitoring et logging ;
- recherche et filtres avancés sur les médecins ;
- déploiement automatique complet.

---

## Auteur

Projet réalisé par Tayeb Salim.

Repository GitHub :

```txt
https://github.com/salimtayeb/medibook
```
