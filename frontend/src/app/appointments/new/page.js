"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewAppointmentPage() {
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

  useEffect(() => {
    async function loadDoctor() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/doctors`, {
          cache: "no-store"
        });
        const data = await response.json();
        const selectedDoctor = data.doctors.find((item) => item.id === doctorId);
        setDoctor(selectedDoctor);
      } catch (err) {
        setError("Impossible de charger le médecin");
      }
    }

    loadDoctor();
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const startAt = new Date(`${date}T${time}:00`);
      const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
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
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <a href="/doctors" className="backLink">← Retour aux médecins</a>

        <p className="badge">Réservation</p>
        <h1>Réserver un rendez-vous</h1>

        {doctor && (
          <p className="description">
            Avec Dr {doctor.user.firstName} {doctor.user.lastName} — {doctor.specialty}
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
