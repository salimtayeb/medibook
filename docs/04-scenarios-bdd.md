# Phase 4 — Scénarios BDD

## Feature: Authentification

### Scenario: Inscription réussie

Given un patient est sur la page d’inscription  
When il saisit un email valide, un mot de passe valide, un prénom et un nom  
Then son compte est créé  
And son rôle est PATIENT  

### Scenario: Connexion réussie

Given un utilisateur possède un compte  
When il saisit un email et un mot de passe valides  
Then il est connecté à l’application  
And un token JWT est généré  
And il accède à son tableau de bord  

## Feature: Médecins

### Scenario: Consultation de la liste des médecins

Given un patient est sur la page des médecins  
When il ouvre la liste des médecins  
Then les médecins disponibles sont affichés  
And chaque médecin possède une spécialité et une ville  

## Feature: Rendez-vous

### Scenario: Réservation réussie d’un rendez-vous

Given un patient est connecté  
And un médecin est disponible  
When le patient choisit une date, une heure et un motif  
Then le rendez-vous est créé  
And il apparaît dans le tableau de bord du patient  

### Scenario: Annulation d’un rendez-vous

Given un patient est connecté  
And il possède un rendez-vous non annulé  
When il clique sur le bouton Annuler  
Then le statut du rendez-vous devient CANCELLED  
And le rendez-vous reste visible dans son tableau de bord  

### Scenario: Refus d’un créneau déjà réservé

Given un patient est connecté  
And un rendez-vous existe déjà sur un créneau donné  
When un autre rendez-vous est demandé sur le même créneau  
Then la réservation est refusée  
And un message indique que le créneau est déjà réservé  
