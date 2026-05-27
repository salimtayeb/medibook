"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

function NewAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("2026-02-15");
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("Consultation médicale");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  useEffect(() => {
    async function loadDoctor() {
      try {
        const response = await api("/api/doctors");
        const data = await response.json();
        const selectedDoctor = data.doctors.find((item) => item.id === doctorId);
        setDoctor(selectedDoctor);
      } catch {
        setError("Impossible de charger le médecin");
      } finally {
        setLoadingDoctor(false);
      }
    }

    if (doctorId) loadDoctor();
    else setLoadingDoctor(false);
  }, [doctorId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("medibook_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const startAt = new Date(`${date}T${time}:00`);
      const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

      const response = await api("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          reason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Impossible de réserver ce rendez-vous");
        return;
      }

      setSuccess("Rendez-vous réservé avec succès");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  if (loadingDoctor) {
    return (
      <main className="authPage">
        <section className="authCard">
          <p className="badge">Réservation</p>
          <div className="skeleton skeletonText" />
          <div className="skeleton skeletonTextShort" />
          <div className="skeleton skeletonCard" style={{ height: "250px", marginTop: "20px" }} />
        </section>
      </main>
    );
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="badge">Réservation</p>
        <h1>Réserver un rendez-vous</h1>

        {doctor && (
          <p className="description">
            Avec Dr {doctor.user.firstName} {doctor.user.lastName} &mdash; {doctor.specialty}
          </p>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            Heure
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </label>

          <label>
            Motif
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows="4"
            />
          </label>

          {error && <p className="errorMessage">{error}</p>}
          {success && <p className="successMessage">{success}</p>}

          <button type="submit" className="primaryButton" disabled={loading}>
            {loading ? "Réservation..." : "Confirmer le rendez-vous"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense
      fallback={
        <main className="authPage">
          <section className="authCard">
            <p>Chargement...</p>
          </section>
        </main>
      }
    >
      <NewAppointmentContent />
    </Suspense>
  );
}
