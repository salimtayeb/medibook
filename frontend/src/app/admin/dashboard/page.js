"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
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

      if (userData.user.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }

      const appointmentsResponse = await fetch(`${apiUrl}/api/appointments/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const appointmentsData = await appointmentsResponse.json();

      const doctorsResponse = await fetch(`${apiUrl}/api/doctors`);
      const doctorsData = await doctorsResponse.json();

      setUser(userData.user);
      setAppointments(appointmentsData.appointments || []);
      setDoctors(doctorsData.doctors || []);
    } catch (err) {
      setError("Impossible de charger l’espace administrateur");
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
          <p className="badge">Espace administrateur</p>
          <h1>Bonjour {user?.firstName}</h1>
          <p className="description">
            Supervisez les médecins et les rendez-vous de la plateforme MediBook.
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
          <span>Médecins</span>
          <strong>{doctors.length}</strong>
        </article>

        <article className="statCard">
          <span>Rendez-vous</span>
          <strong>{appointments.length}</strong>
        </article>
      </section>

      <section className="appointmentsSection">
        <div className="sectionHeader">
          <h2>Tous les rendez-vous</h2>
        </div>

        {appointments.length === 0 ? (
          <p className="emptyMessage">
            Aucun rendez-vous enregistré pour le moment.
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
                    Médecin : Dr {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                  </p>

                  <p className="appointmentMeta">
                    Date : {new Date(appointment.startAt).toLocaleString("fr-FR")}
                  </p>

                  <p className="appointmentMeta">
                    Motif : {appointment.reason || "Non renseigné"}
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
