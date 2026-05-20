"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
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

      const appointmentsResponse = await fetch(`${apiUrl}/api/appointments/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const appointmentsData = await appointmentsResponse.json();

      setUser(userData.user);
      setAppointments(appointmentsData.appointments || []);
    } catch (err) {
      setError("Impossible de charger le tableau de bord");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function cancelAppointment(appointmentId) {
    const confirmCancel = window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?");

    if (!confirmCancel) {
      return;
    }

    try {
      const token = localStorage.getItem("medibook_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Impossible d’annuler le rendez-vous");
        return;
      }

      await loadDashboard();
    } catch (err) {
      setError("Impossible de contacter le serveur");
    }
  }

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
          <p className="badge">Tableau de bord</p>
          <h1>Bonjour {user?.firstName}</h1>
          <p className="description">
            Bienvenue dans votre espace MediBook.
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
          <span>Rendez-vous</span>
          <strong>{appointments.length}</strong>
        </article>
      </section>

      <section className="appointmentsSection">
        <div className="sectionHeader">
          <h2>Mes rendez-vous</h2>
          <a href="/doctors" className="primaryButton">
            Nouveau rendez-vous
          </a>
        </div>

        {appointments.length === 0 ? (
          <p className="emptyMessage">
            Vous n’avez pas encore de rendez-vous.
          </p>
        ) : (
          <div className="appointmentList">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="appointmentCard">
                <div>
                  <h3>
                    Dr {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                  </h3>

                  <p className="appointmentMeta">
                    {new Date(appointment.startAt).toLocaleString("fr-FR")}
                  </p>

                  <p className="appointmentMeta">
                    Motif : {appointment.reason || "Non renseigné"}
                  </p>
                </div>

                <div className="appointmentActions">
                  <span className="statusBadge">
                    {appointment.status}
                  </span>

                  {appointment.status !== "CANCELLED" && (
                    <button
                      onClick={() => cancelAppointment(appointment.id)}
                      className="cancelButton"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
