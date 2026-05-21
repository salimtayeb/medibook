# Phase 5 — Modèle de données

## Présentation

La base de données de MediBook est une base PostgreSQL.

Elle est gérée avec Prisma ORM.

Le modèle contient trois entités principales :

- User
- DoctorProfile
- Appointment

## Table User

La table User représente les utilisateurs de la plateforme.

Champs principaux :

- id : identifiant unique
- email : email unique de l’utilisateur
- password : mot de passe hashé
- firstName : prénom
- lastName : nom
- role : rôle de l’utilisateur
- createdAt : date de création
- updatedAt : date de modification

Rôles possibles :

- PATIENT
- DOCTOR
- ADMIN

Relations :

- un utilisateur peut avoir un profil médecin
- un patient peut avoir plusieurs rendez-vous

## Table DoctorProfile

La table DoctorProfile représente le profil médical d’un médecin.

Champs principaux :

- id : identifiant unique
- userId : identifiant de l’utilisateur médecin
- specialty : spécialité médicale
- city : ville
- description : description du médecin
- price : prix de consultation
- createdAt : date de création
- updatedAt : date de modification

Relations :

- un profil médecin appartient à un utilisateur
- un profil médecin peut avoir plusieurs rendez-vous

## Table Appointment

La table Appointment représente un rendez-vous médical.

Champs principaux :

- id : identifiant unique
- patientId : identifiant du patient
- doctorId : identifiant du profil médecin
- startAt : date et heure de début
- endAt : date et heure de fin
- reason : motif du rendez-vous
- status : statut du rendez-vous
- createdAt : date de création
- updatedAt : date de modification

Statuts possibles :

- PENDING
- CONFIRMED
- CANCELLED
- COMPLETED

Relations :

- un rendez-vous appartient à un patient
- un rendez-vous appartient à un médecin

## Relations globales

User 1 → 0..1 DoctorProfile

User 1 → plusieurs Appointment en tant que patient

DoctorProfile 1 → plusieurs Appointment
