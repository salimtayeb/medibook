"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState("");
  const [nearby, setNearby] = useState(false);

  async function loadPharmacies() {
    setLoading(true);
    setError("");
    try {
      let url = "/api/pharmacies";
      if (city.trim()) url += `?city=${encodeURIComponent(city.trim())}`;
      const response = await api(url);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setPharmacies(data.pharmacies || []);
    } catch {
      setError("Impossible de charger les pharmacies");
    } finally {
      setLoading(false);
    }
  }

  function getLocation() {
    if (!navigator.geolocation) {
      setError("Géolocalisation non disponible");
      return;
    }
    setNearby(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const response = await api(`/api/pharmacies?lat=${latitude}&lng=${longitude}&radius=10`);
          const data = await response.json();
          setPharmacies(data.pharmacies || []);
        } catch {
          setError("Erreur de recherche");
        } finally {
          setLoading(false);
          setNearby(false);
        }
      },
      () => {
        setError("Impossible d'obtenir votre position");
        setNearby(false);
        setLoading(false);
      }
    );
  }

  useEffect(() => {
    loadPharmacies();
  }, []);

  return (
    <main className="page">
      <section className="pageHeader">
        <p className="badge">Pharmacies</p>
        <h1>Pharmacies à proximité</h1>
        <p className="description">
          Trouvez les pharmacies près de chez vous.
        </p>
      </section>

      <section className="searchSection">
        <div className="searchForm">
          <input
            type="text"
            className="searchInput"
            placeholder="Rechercher par ville..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={loadPharmacies} className="primaryButton" style={{ border: "none", cursor: "pointer" }}>
            Rechercher
          </button>
          <button
            onClick={getLocation}
            className="secondaryButton"
            style={{ border: "none", cursor: "pointer" }}
            disabled={nearby}
          >
            {nearby ? "Localisation..." : "À proximité"}
          </button>
        </div>
      </section>

      {error && <p className="errorMessage">{error}</p>}

      {loading ? (
        <section className="doctorGrid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="doctorCard">
              <div className="skeleton skeletonText" />
              <div className="skeleton skeletonTextShort" />
              <div className="skeleton skeletonText" />
            </div>
          ))}
        </section>
      ) : (
        <section className="doctorGrid">
          {pharmacies.length === 0 ? (
            <p className="emptyMessage">Aucune pharmacie trouvée.</p>
          ) : (
            pharmacies.map((p) => (
              <article key={p.id} className="doctorCard">
                <div>
                  <h2>{p.name}</h2>
                  <p className="city">{p.address}</p>
                  <p className="specialty">{p.city}</p>
                  {p.phone && <p className="appointmentMeta">📞 {p.phone}</p>}
                  {p.openingHours && <p className="appointmentMeta">🕐 {p.openingHours}</p>}
                </div>
              </article>
            ))
          )}
        </section>
      )}
    </main>
  );
}
