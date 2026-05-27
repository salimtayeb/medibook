"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";

export default function DoctorsPage() {
  const { user, token } = useAuth();
  const addToast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [locating, setLocating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadDoctors(); }, [search, specialty, city]);
  useEffect(() => { if (token && user?.role === "PATIENT") loadFavorites(); }, [token, user]);

  async function loadDoctors() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("city", search);
      if (specialty) params.set("specialty", specialty);
      if (city) params.set("city", city);
      const res = await api(`/api/doctors?${params}`);
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch {} finally { setLoading(false); }
  }

  async function loadFavorites() {
    try {
      const res = await api("/api/favorites");
      const data = await res.json();
      setFavorites((data.favorites || []).map(f => f.doctorId));
    } catch {}
  }

  async function toggleFavorite(doctorId) {
    if (!token) { addToast("Connectez-vous pour ajouter aux favoris", "error"); return; }
    try {
      if (favorites.includes(doctorId)) {
        await api(`/api/favorites/${doctorId}`, { method: "DELETE" });
        setFavorites(favorites.filter(id => id !== doctorId));
        addToast("Retiré des favoris", "success");
      } else {
        await api(`/api/favorites/${doctorId}`, { method: "POST" });
        setFavorites([...favorites, doctorId]);
        addToast("Ajouté aux favoris", "success");
      }
    } catch (e) { addToast("Erreur", "error"); }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!token) { addToast("Connectez-vous pour laisser un avis", "error"); return; }
    setSubmitting(true);
    try {
      const res = await api("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: showReviewModal, rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      addToast("Avis ajouté !", "success");
      setShowReviewModal(null);
      setReviewRating(5);
      setReviewComment("");
      loadDoctors();
    } catch (e) { addToast(e.message, "error"); }
    finally { setSubmitting(false); }
  }

  function locateMe() {
    if (!navigator.geolocation) { addToast("Géolocalisation non disponible", "error"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadDoctorsByLocation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => { addToast("Impossible de vous localiser", "error"); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function loadDoctorsByLocation(lat, lng) {
    try {
      const params = new URLSearchParams({ lat, lng, radius: "10" });
      if (specialty) params.set("specialty", specialty);
      if (city) params.set("city", city);
      const res = await api(`/api/doctors?${params}`);
      const data = await res.json();
      setDoctors(data.doctors || []);
      if (!data.doctors?.length) {
        addToast("Aucun médecin trouvé à proximité. Les médecins doivent définir leur localisation.", "error");
      }
    } catch {} finally { setLoading(false); }
  }

  const specialities = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];
  const cities = [...new Set(doctors.map(d => d.city).filter(Boolean))];

  const sorted = [...doctors].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

  return (
    <div className="page">
      <div className="pageHeader">
        <h1>👨‍⚕️ Trouver un médecin</h1>
        <p style={{color:"var(--text-secondary)",marginTop:6}}>Recherchez par spécialité ou localisation</p>
      </div>

      <div className="searchSection">
        <div className="searchForm">
          <input className="searchInput" placeholder="Rechercher par ville..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="searchInput" style={{minWidth:140,flex:"none"}} value={specialty} onChange={e => setSpecialty(e.target.value)}>
            <option value="">Toutes spécialités</option>
            {specialities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="searchInput" style={{minWidth:120,flex:"none"}} value={city} onChange={e => setCity(e.target.value)}>
            <option value="">Toutes villes</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="secondaryButton" style={{flex:"none"}} onClick={locateMe} disabled={locating}>
            {locating ? "📍..." : "📍 À proximité"}
          </button>
          {user?.role === "PATIENT" && (
            <Link href="/doctor/dashboard" className="secondaryButton" style={{display:"none"}}></Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="doctorGrid">
          {[1,2,3].map(i => <div key={i} className="skeleton skeletonCard" />)}
        </div>
      ) : sorted.length === 0 ? (
        <p className="emptyMessage">Aucun médecin trouvé.</p>
      ) : (
        <div className="doctorGrid">
          {sorted.map((d) => {
            const avg = d.averageRating || 0;
            const fullStars = Math.round(avg);
            const isFav = favorites.includes(d.id);
            return (
              <div key={d.id} className="doctorCard" style={{position:"relative"}}>
                {user?.role === "PATIENT" && (
                  <button className={`favBtn${isFav ? " active" : ""}`} onClick={() => toggleFavorite(d.id)} title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}>
                    {isFav ? "❤️" : "🤍"}
                  </button>
                )}
                <div>
                  <h2>Dr. {d.user?.firstName} {d.user?.lastName}</h2>
                  <div className="specialty">{d.specialty}</div>
                  <div className="city">📍 {d.city}{d.user?.phone ? ` · ${d.user.phone}` : ""}</div>
                  {d.description && <p className="doctorDescription">{d.description}</p>}
                  <div className="reviewAvg" style={{marginTop:10}}>
                    <div className="stars stars--readonly">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= fullStars ? "filled" : ""}>
                          {s <= fullStars ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <strong>{avg > 0 ? avg : "—"}</strong>
                    <span>({d.reviewCount || 0})</span>
                    {user?.role === "PATIENT" && (
                      <button onClick={() => setShowReviewModal(d.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--primary)",fontWeight:700,marginLeft:4}}>
                        Noter
                      </button>
                    )}
                  </div>
                </div>
                <div className="doctorFooter">
                  {d.price && <span className="price">{d.price} €</span>}
                  <Link href={`/appointments/new?doctorId=${d.id}`} className="primaryButton" style={{padding:"10px 16px",fontSize:13}}>
                    Prendre RDV
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showReviewModal && (
        <div className="modalOverlay" onClick={() => setShowReviewModal(null)}>
          <div className="modalContent" onClick={e => e.stopPropagation()}>
            <h2>Noter le médecin</h2>
            <form onSubmit={handleReviewSubmit} className="form">
              <label>
                Note
                <div className="stars" style={{fontSize:28,marginTop:4}}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={s <= reviewRating ? "filled" : ""} onClick={() => setReviewRating(s)}>
                      {s <= reviewRating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              </label>
              <label>
                Commentaire (optionnel)
                <textarea rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Votre avis..." />
              </label>
              <button className="primaryButton" type="submit" disabled={submitting}>
                {submitting ? "Envoi..." : "Envoyer l'avis"}
              </button>
              <button type="button" className="secondaryButton" onClick={() => setShowReviewModal(null)}>Annuler</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
