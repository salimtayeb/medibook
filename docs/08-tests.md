# Phase 7 — Tests logiciels

## Objectif

L’objectif des tests est de vérifier que l’application MediBook fonctionne correctement côté backend et côté frontend.

Le projet contient deux types de tests :

- tests backend avec Jest et Supertest
- tests E2E frontend avec Playwright

## Tests backend

Les tests backend vérifient :

- les routes publiques
- l’inscription utilisateur
- la connexion utilisateur
- la génération du token JWT
- les routes protégées
- les rôles utilisateurs
- la liste des médecins
- la création de rendez-vous
- les conflits de créneaux
- l’affichage des rendez-vous
- l’annulation de rendez-vous
- les erreurs serveur
- les cas limites

Commande :

npm test

Commande avec couverture :

npm test -- --coverage

Résultat obtenu :

- Test Suites : 3 passed
- Tests : 43 passed
- Statements : 100%
- Branches : 100%
- Functions : 100%
- Lines : 100%

## Tests E2E frontend

Les tests E2E sont réalisés avec Playwright.

Ils vérifient le parcours utilisateur côté navigateur.

Test réalisé :

- affichage de la page d’accueil MediBook
- présence du bouton Voir les médecins
- présence du bouton Créer un compte
- présence du bouton Se connecter

Commande :

npm run e2e

## CI/CD

Les tests backend et les tests E2E frontend sont exécutés automatiquement dans GitHub Actions à chaque push sur la branche main.
