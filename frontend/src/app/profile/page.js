"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import api from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, fetchUser } = useAuth();
  const addToast = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
    }
  }, [user, authLoading]);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await api("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ firstName, lastName, phone })
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Erreur");
        return;
      }
      addToast("Profil mis à jour");
      fetchUser();
    } catch {
      setError("Erreur serveur");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setChangingPassword(true);
    try {
      const response = await api("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!response.ok) {
        const data = await response.json();
        setPasswordError(data.message || "Erreur");
        return;
      }
      addToast("Mot de passe modifié");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPasswordError("Erreur serveur");
    } finally {
      setChangingPassword(false);
    }
  }

  if (authLoading) {
    return (
      <main className="authPage">
        <section className="authCard">
          <div className="skeleton skeletonText" />
          <div className="skeleton skeletonTextShort" />
        </section>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="badge">Mon profil</p>
        <h1>{user.firstName} {user.lastName}</h1>
        <p className="description">
          Modifiez vos informations personnelles.
        </p>

        <form onSubmit={handleProfileSubmit} className="form">
          <label>
            Prénom
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label>
            Nom
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={user.email} disabled style={{ opacity: 0.6 }} />
          </label>
          <label>
            Téléphone
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            Rôle
            <input type="text" value={user.role === "PATIENT" ? "Patient" : user.role === "DOCTOR" ? "Médecin" : "Administrateur"} disabled style={{ opacity: 0.6 }} />
          </label>

          {error && <p className="errorMessage">{error}</p>}
          <button type="submit" className="primaryButton" disabled={saving}>
            {saving ? <><Spinner /> Enregistrement...</> : "Enregistrer"}
          </button>
        </form>

        <hr className="profileDivider" />

        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Changer le mot de passe</h2>

        <form onSubmit={handlePasswordSubmit} className="form">
          <label>
            Mot de passe actuel
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </label>
          <label>
            Nouveau mot de passe
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
          </label>

          {passwordError && <p className="errorMessage">{passwordError}</p>}
          <button type="submit" className="primaryButton" disabled={changingPassword}>
            {changingPassword ? <><Spinner /> Modification...</> : "Changer le mot de passe"}
          </button>
        </form>
      </section>
    </main>
  );
}
