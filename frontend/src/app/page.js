export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="heroContent">
          <p className="badge">Plateforme médicale en ligne</p>

          <h1>
            Réservez vos rendez-vous médicaux simplement avec MediBook
          </h1>

          <p className="description">
            MediBook permet aux patients de trouver un médecin, consulter ses
            informations et réserver un rendez-vous en ligne.
          </p>

          <div className="actions">
            <a href="/doctors" className="primaryButton">
              Voir les médecins
            </a>
            <a href="/register" className="secondaryButton">
              Créer un compte
            </a>
            <a href="/login" className="secondaryButton">
              Se connecter
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
