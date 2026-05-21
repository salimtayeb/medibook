# Phase 5 — Documentation API REST

## Présentation

Le backend de MediBook expose une API REST développée avec Node.js et Express.js.

L’API permet de gérer :

- l’authentification
- les médecins
- les rendez-vous
- la vérification de santé du serveur

URL locale du backend :

http://localhost:5000

## Endpoints de santé

### GET /

Description :

Retourne un message d’accueil de l’API.

Réponse attendue :

{
  "message": "Bienvenue sur l'API MediBook",
  "status": "OK"
}

### GET /api/health

Description :

Vérifie que l’API fonctionne.

Réponse attendue :

{
  "status": "OK",
  "service": "MediBook API",
  "timestamp": "date"
}

### GET /api/db-check

Description :

Vérifie la connexion à la base de données PostgreSQL.

Réponse attendue :

{
  "status": "OK",
  "database": "connected"
}

## Endpoints d’authentification

### POST /api/auth/register

Description :

Créer un compte patient.

Body :

{
  "email": "patient@test.com",
  "password": "password123",
  "firstName": "Ali",
  "lastName": "Benali"
}

Codes HTTP possibles :

- 201 : compte créé
- 400 : données invalides
- 409 : email déjà utilisé
- 500 : erreur serveur

### POST /api/auth/login

Description :

Connecter un utilisateur.

Body :

{
  "email": "patient@test.com",
  "password": "password123"
}

Réponse attendue :

{
  "message": "Connexion réussie",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "patient@test.com",
    "role": "PATIENT"
  }
}

Codes HTTP possibles :

- 200 : connexion réussie
- 400 : données invalides
- 401 : identifiants incorrects
- 500 : erreur serveur

### GET /api/auth/me

Description :

Récupérer l’utilisateur connecté.

Protection :

JWT obligatoire.

Header :

Authorization: Bearer token

Codes HTTP possibles :

- 200 : utilisateur connecté retourné
- 401 : token manquant, invalide ou expiré

### GET /api/auth/admin-test

Description :

Tester une route réservée aux administrateurs.

Protection :

JWT obligatoire + rôle ADMIN.

Codes HTTP possibles :

- 200 : accès autorisé
- 401 : utilisateur non authentifié
- 403 : accès interdit

## Endpoints médecins

### GET /api/doctors

Description :

Récupérer la liste des médecins disponibles.

Protection :

Aucune.

Codes HTTP possibles :

- 200 : liste récupérée
- 500 : erreur serveur

## Endpoints rendez-vous

### POST /api/appointments

Description :

Créer un rendez-vous médical.

Protection :

JWT obligatoire + rôle PATIENT.

Body :

{
  "doctorId": "doctor-profile-id",
  "startAt": "2030-05-20T10:00:00.000Z",
  "endAt": "2030-05-20T10:30:00.000Z",
  "reason": "Consultation médicale générale"
}

Codes HTTP possibles :

- 201 : rendez-vous créé
- 400 : données invalides ou date incorrecte
- 403 : utilisateur non patient
- 404 : médecin introuvable
- 409 : créneau déjà réservé
- 500 : erreur serveur

### GET /api/appointments/me

Description :

Récupérer les rendez-vous de l’utilisateur connecté.

Protection :

JWT obligatoire.

Comportement :

- un patient voit ses rendez-vous
- un médecin voit les rendez-vous associés à son profil
- un administrateur voit tous les rendez-vous

Codes HTTP possibles :

- 200 : rendez-vous récupérés
- 401 : token manquant ou invalide
- 404 : profil médecin introuvable
- 500 : erreur serveur

### PATCH /api/appointments/:id/cancel

Description :

Annuler un rendez-vous.

Protection :

JWT obligatoire.

Règles :

- un patient peut annuler ses propres rendez-vous
- un médecin peut annuler ses rendez-vous
- un administrateur peut annuler tous les rendez-vous
- un rendez-vous déjà annulé ne peut pas être annulé à nouveau

Codes HTTP possibles :

- 200 : rendez-vous annulé
- 400 : rendez-vous déjà annulé
- 403 : accès interdit
- 404 : rendez-vous introuvable
- 500 : erreur serveur
