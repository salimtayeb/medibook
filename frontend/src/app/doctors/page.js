async function getDoctors() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const response = await fetch(`${apiUrl}/api/doctors`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer les médecins");
  }

  return response.json();
}

export default async function DoctorsPage() {
  const data = await getDoctors();
  const doctors = data.doctors || [];

  return (
    <main className="page">
      <section className="pageHeader">
        <a href="/" className="backLink">← Retour à l’accueil</a>
        <p className="badge">Médecins disponibles</p>
        <h1>Choisissez un médecin</h1>
        <p className="description">
          Consultez les médecins disponibles sur MediBook et préparez votre réservation.
        </p>
      </section>

      <section className="doctorGrid">
        {doctors.map((doctor) => (
          <article key={doctor.id} className="doctorCard">
            <div>
              <h2>
                Dr {doctor.user.firstName} {doctor.user.lastName}
              </h2>
              <p className="specialty">{doctor.specialty}</p>
              <p className="city">{doctor.city}</p>
              <p className="doctorDescription">{doctor.description}</p>
            </div>

            <div className="doctorFooter">
              <span>{doctor.price ? `${doctor.price} €` : "Prix non renseigné"}</span>
              <a href={`/appointments/new?doctorId=${doctor.id}`} className="primaryButton">
                Réserver
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
