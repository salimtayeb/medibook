"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

const FILTERS = [
  { key: "ALL", label: "Tous" },
  { key: "PENDING", label: "En attente" },
  { key: "CONFIRMED", label: "Confirmé" },
  { key: "COMPLETED", label: "Terminé" },
  { key: "CANCELLED", label: "Annulé" },
];

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const addToast = useToast();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [tab, setTab] = useState("appointments");

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (user && user.role !== "ADMIN") { router.push("/dashboard"); return; }
    if (!user) return;
    loadAll();
  }, [user, token]);

  async function loadAll() {
    try {
      const [appRes, docRes] = await Promise.all([
        api("/api/appointments/me"),
        api("/api/doctors")
      ]);
      const appData = await appRes.json();
      const docData = await docRes.json();
      setAppointments(appData.appointments || []);
      setDoctors(docData.doctors || []);
    } catch {}
    finally { setLoading(false); }
  }

  const handleConfirm = useCallback(async (id) => {
    try {
      const res = await api(`/api/appointments/${id}/confirm`, { method: "PATCH" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      addToast("Rendez-vous confirmé", "success");
      loadAll();
    } catch (e) { addToast(e.message, "error"); }
  }, []);

  const handleComplete = useCallback(async (id) => {
    try {
      const res = await api(`/api/appointments/${id}/complete`, { method: "PATCH" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      addToast("Rendez-vous terminé", "success");
      loadAll();
    } catch (e) { addToast(e.message, "error"); }
  }, []);

  const handleCancel = useCallback(async (id) => {
    try {
      const res = await api(`/api/appointments/${id}/cancel`, { method: "PATCH" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      addToast("Rendez-vous annulé", "success");
      loadAll();
    } catch (e) { addToast(e.message, "error"); }
  }, []);

  const counts = {};
  FILTERS.forEach((f) => { counts[f.key] = f.key === "ALL" ? appointments.length : appointments.filter((a) => a.status === f.key).length; });
  const filtered = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter);

  if (loading) {
    return (
      <div className="page">
        <div className="statsGrid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeletonCard" style={{height:100}} />)}
        </div>
        <div className="skeleton" style={{height:300}} />
      </div>
    );
  }

  const pendingCount = counts.PENDING;
  const completedCount = counts.COMPLETED;
  const cancelledCount = counts.CANCELLED;

  return (
    <div className="page">
      <div className="dashboardHeader">
        <div>
          <h1 style={{margin:0}}>Administration 🛡️</h1>
          <p style={{color:"var(--text-secondary)",marginTop:6}}>{user?.firstName} {user?.lastName}</p>
        </div>
        <button className="navbarLogout" onClick={logout}>
          <span>✕</span> Déconnexion
        </button>
      </div>

      <div className="statsGrid">
        <div className="statCard statCard--primary">
          <div className="statIcon">📅</div>
          <span className="statLabel">Rendez-vous</span>
          <strong className="statValue">{appointments.length}</strong>
        </div>
        <div className="statCard statCard--success">
          <div className="statIcon">👨‍⚕️</div>
          <span className="statLabel">Médecins</span>
          <strong className="statValue">{doctors.length}</strong>
        </div>
        <div className="statCard statCard--warning">
          <div className="statIcon">⏳</div>
          <span className="statLabel">En attente</span>
          <strong className="statValue">{pendingCount}</strong>
        </div>
        <div className="statCard statCard--danger">
          <div className="statIcon">✕</div>
          <span className="statLabel">Annulés</span>
          <strong className="statValue">{cancelledCount}</strong>
        </div>
      </div>

      <div className="filterTabs" style={{marginBottom:20}}>
        <button className={`filterTab${tab === "appointments" ? " filterTab--active" : ""}`} onClick={() => setTab("appointments")}>
          📋 Rendez-vous ({appointments.length})
        </button>
        <button className={`filterTab${tab === "doctors" ? " filterTab--active" : ""}`} onClick={() => setTab("doctors")}>
          👨‍⚕️ Médecins ({doctors.length})
        </button>
      </div>

      {tab === "appointments" && (
        <div className="appointmentsSection">
          <div className="sectionHeader">
            <h2>Tous les rendez-vous</h2>
          </div>
          <div className="filterTabs">
            {FILTERS.map((f) => (
              <button key={f.key} className={`filterTab${filter === f.key ? " filterTab--active" : ""}`} onClick={() => setFilter(f.key)}>
                {f.label} <span className="filterCount">{counts[f.key]}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="emptyMessage">Aucun rendez-vous.</p>
          ) : (
            <div className="appointmentList">
              {filtered.map((a) => (
                <div key={a.id} className="appointmentCard">
                  <div>
                    <h3>{a.patient?.firstName} {a.patient?.lastName} → Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}</h3>
                    <div className="appointmentMeta">
                      <span>📅 {formatDate(a.startAt)}</span>
                      <span>🏥 {a.doctor?.specialty}</span>
                      {a.reason && <span>💬 {a.reason}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <span className={`statusBadge statusBadge--${a.status.toLowerCase()}`}>
                      {a.status === "PENDING" && "⏳"}
                      {a.status === "CONFIRMED" && "✅"}
                      {a.status === "COMPLETED" && "✔️"}
                      {a.status === "CANCELLED" && "✕"}
                      {" "}{STATUS_LABELS[a.status]}
                    </span>
                    <div className="appointmentActions">
                      {a.status === "PENDING" && (
                        <>
                          <button className="confirmButton" onClick={() => handleConfirm(a.id)}>✅ Confirmer</button>
                          <button className="cancelButton" onClick={() => handleCancel(a.id)}>Annuler</button>
                        </>
                      )}
                      {a.status === "CONFIRMED" && (
                        <>
                          <button className="completeButton" onClick={() => handleComplete(a.id)}>✔️ Terminer</button>
                          <button className="cancelButton" onClick={() => handleCancel(a.id)}>Annuler</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "doctors" && (
        <div>
          <div className="doctorGrid">
            {doctors.map((d) => (
              <div key={d.id} className="doctorCard">
                <div>
                  <h2>Dr. {d.user?.firstName} {d.user?.lastName}</h2>
                  <div className="specialty">{d.specialty}</div>
                  <div className="city">📍 {d.city}</div>
                  {d.description && <p className="doctorDescription">{d.description}</p>}
                  <div className="reviewAvg" style={{marginTop:8}}>
                    <div className="stars stars--readonly">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= Math.round(d.averageRating || 0) ? "filled" : ""}>
                          {s <= Math.round(d.averageRating || 0) ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <strong>{d.averageRating || "—"}</strong>
                    <span>({d.reviewCount || 0} avis)</span>
                  </div>
                </div>
                <div className="doctorFooter">
                  {d.price && <span className="price">{d.price} €</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
