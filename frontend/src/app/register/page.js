"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("Nadia");
  const [lastName, setLastName] = useState("Durand");
  const [email, setEmail] = useState("nadia@test.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erreur lors de l’inscription");
        return;
      }

      setSuccess("Compte créé avec succès. Redirection vers la connexion...");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <a href="/" className="backLink">← Retour à l’accueil</a>

        <p className="badge">Inscription</p>
        <h1>Créer un compte</h1>

        <p className="description">
          Créez un compte patient pour réserver vos rendez-vous médicaux.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Prénom
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>

          <label>
            Nom
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="errorMessage">{error}</p>}
          {success && <p className="successMessage">{success}</p>}

          <button type="submit" className="primaryButton" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="authLinkText">
          Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </section>
    </main>
  );
}
