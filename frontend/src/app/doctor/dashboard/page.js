"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const token = localStorage.getItem("medibook_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const userResponse = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        localStorage.removeItem("medibook_token");
        localStorage.removeItem("medibook_user");
        router.push("/login");
        return;
      }

      if (userData.user.role !== "DOCTOR") {
        router.push("/dashboard");
        return;
      }

      const appointmentsResponse = await fetch(`${apiUrl}/api/appointments/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const appointmentsData = await appointmentsResponse.json();

      setUser(userData.user);
      setAppointments(appointmentsData.appointments || []);
    } catch (err) {
      setError("Impossible de charger l’espace médecin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function logout() {
    localStorage.removeItem("medibook_token");
    localStorage.removeItem("medibook_user");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="page">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="dashboardHeader">
        <div>
          <a href="/" className="backLink">← Retour à l’accueil</a>
          <p className="badge">Espace médecin</p>
          <h1>Bonjour Dr {user?.lastName}</h1>
          <p className="description">
            Consultez les rendez-vous associés à votre profil médecin.
          </p>
        </div>

        <button onClick={logout} className="logoutButton">
          Se déconnecter
        </button>
      </section>

      {error && <p className="errorMessage">{error}</p>}

      <section className="statsGrid">
        <article className="statCard">
          <span>Rôle</span>
          <strong>{user?.role}</strong>
        </article>

        <article className="statCard">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </article>

        <article className="statCard">
          <span>Rendez-vous reçus</span>
          <strong>{appointments.length}</strong>
        </article>
      </section>

      <section className="appointmentsSection">
        <div className="sectionHeader">
          <h2>Mes consultations</h2>
        </div>

        {appointments.length === 0 ? (
          <p className="emptyMessage">
            Aucun rendez-vous n’est encore associé à votre profil médecin.
          </p>
        ) : (
          <div className="appointmentList">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="appointmentCard">
                <div>
                  <h3>
                    Patient : {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </h3>

                  <p className="appointmentMeta">
                    Date : {new Date(appointment.startAt).toLocaleString("fr-FR")}
                  </p>

                  <p className="appointmentMeta">
                    Motif : {appointment.reason || "Non renseigné"}
                  </p>

                  <p className="appointmentMeta">
                    Email patient : {appointment.patient?.email}
                  </p>
                </div>

                <span className="statusBadge">
                  {appointment.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
