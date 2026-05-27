export default function NotFound() {
  return (
    <main className="authPage">
      <section className="authCard" style={{ textAlign: "center" }}>
        <p className="badge">Erreur 404</p>
        <h1>Page introuvable</h1>
        <p className="description">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <a href="/" className="primaryButton" style={{ display: "inline-block" }}>
          Retour à l&apos;accueil
        </a>
      </section>
    </main>
  );
}
