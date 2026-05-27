"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const addToast = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, phone, role })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erreur lors de l'inscription");
        return;
      }

      addToast("Compte créé avec succès !");
      setTimeout(() => router.push("/login"), 1000);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="badge">Inscription</p>
        <h1>Créer un compte</h1>
        <p className="description">
          Inscrivez-vous comme patient ou médecin.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="roleToggle">
            <button
              type="button"
              className={`roleBtn ${role === "PATIENT" ? "roleBtn--active" : ""}`}
              onClick={() => setRole("PATIENT")}
            >
              Patient
            </button>
            <button
              type="button"
              className={`roleBtn ${role === "DOCTOR" ? "roleBtn--active" : ""}`}
              onClick={() => setRole("DOCTOR")}
            >
              Médecin
            </button>
          </div>

          <label>
            Prénom
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>

          <label>
            Nom
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Téléphone
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 XX XX XX XX"
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && <p className="errorMessage">{error}</p>}

          <button type="submit" className="primaryButton" disabled={loading}>
            {loading ? <><Spinner /> Inscription...</> : "Créer mon compte"}
          </button>
        </form>

        <p className="authLinkText">
          Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </section>
    </main>
  );
}
