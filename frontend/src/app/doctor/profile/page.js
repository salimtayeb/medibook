"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import api from "@/lib/api";

export default function DoctorProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const addToast = useToast();

  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user && user.role !== "DOCTOR") { router.push("/dashboard"); return; }
    if (user) loadProfile();
  }, [user, authLoading]);

  async function loadProfile() {
    try {
      const response = await api("/api/doctors/me");
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      const p = data.profile;
      if (p) {
        setSpecialty(p.specialty || "");
        setCity(p.city || "");
        setDescription(p.description || "");
        setPrice(p.price ? String(p.price) : "");
        setAddress(p.address || "");
        setLatitude(p.latitude ? String(p.latitude) : "");
        setLongitude(p.longitude ? String(p.longitude) : "");
      }
    } catch {
      setError("Impossible de charger votre profil");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await api("/api/doctors/profile", {
        method: "PUT",
        body: JSON.stringify({ specialty, city, description, price, address, latitude, longitude })
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Erreur");
        return;
      }
      addToast("Profil mis à jour");
    } catch {
      setError("Erreur serveur");
    } finally {
      setSaving(false);
    }
  }

  function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => addToast("Impossible de localiser", "error")
    );
  }

  if (authLoading || loading) {
    return (
      <main className="authPage">
        <section className="authCard">
          <div className="skeleton skeletonText" />
          <div className="skeleton skeletonTextShort" />
          <div className="skeleton skeletonCard" style={{ height: "200px", marginTop: "20px" }} />
        </section>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="badge">Mon profil</p>
        <h1>Dr {user.lastName}</h1>
        <p className="description">
          Modifiez vos informations et votre localisation.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Spécialité
            <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required />
          </label>
          <label>
            Ville
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </label>
          <label>
            Adresse du cabinet
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 rue exemple" />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" />
          </label>
          <label>
            Prix par consultation (€)
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
          </label>

          <label>
            Latitude
            <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="48.8566" />
          </label>
          <label>
            Longitude
            <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="2.3522" />
          </label>

          <button type="button" onClick={getLocation} className="secondaryButton" style={{ border: "none", cursor: "pointer", textAlign: "center" }}>
            📍 Ma position actuelle
          </button>

          {error && <p className="errorMessage">{error}</p>}
          <button type="submit" className="primaryButton" disabled={saving}>
            {saving ? <><Spinner /> Enregistrement...</> : "Enregistrer"}
          </button>
        </form>
      </section>
    </main>
  );
}
