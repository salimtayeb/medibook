# Phase 3 — Critères d’acceptation

## User Story 1 — Créer un compte

- L’email est obligatoire.
- L’email doit avoir un format valide.
- Le mot de passe doit contenir au moins 8 caractères.
- Le prénom et le nom sont obligatoires.
- L’email doit être unique.
- Un message d’erreur est retourné si l’email existe déjà.
- Le compte créé possède le rôle PATIENT.

## User Story 2 — Se connecter

- L’email est obligatoire.
- Le mot de passe est obligatoire.
- Un token JWT est retourné si les identifiants sont corrects.
- Un message d’erreur est retourné si l’email ou le mot de passe est incorrect.
- L’utilisateur connecté peut accéder à son tableau de bord.

## User Story 3 — Consulter les médecins

- La liste des médecins est accessible publiquement.
- Chaque médecin affiche un nom, une spécialité, une ville, une description et un prix.
- Si aucun médecin n’existe, un message adapté est affiché.

## User Story 4 — Réserver un rendez-vous

- Le patient doit être connecté.
- Le rôle de l’utilisateur doit être PATIENT.
- Le médecin sélectionné doit exister.
- La date de fin doit être après la date de début.
- Le créneau ne doit pas déjà être réservé.
- Un message de succès est affiché après réservation.

## User Story 5 — Voir mes rendez-vous

- L’utilisateur doit être connecté.
- Un patient voit uniquement ses rendez-vous.
- Un médecin voit les rendez-vous associés à son profil.
- Un administrateur peut voir tous les rendez-vous.
- Les rendez-vous sont triés par date.

## User Story 6 — Annuler un rendez-vous

- L’utilisateur doit être connecté.
- Un patient peut annuler uniquement ses propres rendez-vous.
- Un médecin peut annuler les rendez-vous associés à son profil.
- Un administrateur peut annuler n’importe quel rendez-vous.
- Un rendez-vous déjà annulé ne peut pas être annulé une seconde fois.
- Le statut devient CANCELLED après annulation.

## User Story 7 — Consulter les rendez-vous reçus

- Le médecin doit être connecté.
- Le médecin doit avoir un profil médecin.
- Les rendez-vous affichés doivent correspondre au médecin connecté.
- Un message d’erreur est retourné si le profil médecin est introuvable.

## User Story 8 — Être visible dans la liste des médecins

- Le médecin doit avoir un profil DoctorProfile.
- Le profil doit contenir une spécialité.
- Le profil doit contenir une ville.
- Le profil peut contenir une description et un prix.
- Le médecin apparaît dans la liste publique.

## User Story 9 — Accéder aux données globales

- L’utilisateur doit être connecté.
- L’utilisateur doit avoir le rôle ADMIN.
- L’administrateur peut récupérer l’ensemble des rendez-vous.

## User Story 10 — Accéder aux routes réservées admin

- L’utilisateur doit être connecté.
- L’utilisateur doit avoir le rôle ADMIN.
- Un utilisateur non administrateur reçoit une erreur 403.
- Un utilisateur non connecté reçoit une erreur 401.
