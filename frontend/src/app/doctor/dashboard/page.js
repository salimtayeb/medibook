"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import Link from "next/link";

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

export default function DoctorDashboard() {
  const { user, token, logout } = useAuth();
  const addToast = useToast();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (user && user.role !== "DOCTOR") { router.push("/dashboard"); return; }
    if (!user) return;
    loadAppointments();
  }, [user, token]);

  async function loadAppointments() {
    try {
      const res = await api("/api/appointments/me");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch {}
    finally { setLoading(false); }
  }

  const handleConfirm = useCallback(async (id) => {
    try {
      const res = await api(`/api/appointments/${id}/confirm`, { method: "PATCH" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      addToast("Rendez-vous confirmé", "success");
      loadAppointments();
    } catch (e) { addToast(e.message, "error"); }
  }, []);

  const handleComplete = useCallback(async (id) => {
    try {
      const res = await api(`/api/appointments/${id}/complete`, { method: "PATCH" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      addToast("Rendez-vous terminé", "success");
      loadAppointments();
    } catch (e) { addToast(e.message, "error"); }
  }, []);

  const handleCancel = useCallback(async (id) => {
    try {
      const res = await api(`/api/appointments/${id}/cancel`, { method: "PATCH" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      addToast("Rendez-vous annulé", "success");
      loadAppointments();
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
  const todayCount = appointments.filter(a => {
    const today = new Date(); const ad = new Date(a.startAt);
    return ad.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="page">
      <div className="dashboardHeader">
        <div>
          <h1 style={{margin:0}}>Espace médecin 👨‍⚕️</h1>
          <p style={{color:"var(--text-secondary)",marginTop:6}}>Dr. {user?.firstName} {user?.lastName}</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Link href="/doctor/profile" className="secondaryButton" style={{fontSize:13,padding:"10px 14px"}}>✏️ Mon profil</Link>
          <button className="navbarLogout" onClick={logout} style={{margin:0}}>
            <span>✕</span> Déconnexion
          </button>
        </div>
      </div>

      <div className="statsGrid">
        <div className="statCard statCard--primary">
          <div className="statIcon">📅</div>
          <span className="statLabel">Total</span>
          <strong className="statValue">{appointments.length}</strong>
        </div>
        <div className="statCard statCard--success">
          <div className="statIcon">🟢</div>
          <span className="statLabel">Aujourd&apos;hui</span>
          <strong className="statValue">{todayCount}</strong>
        </div>
        <div className="statCard statCard--warning">
          <div className="statIcon">⏳</div>
          <span className="statLabel">En attente</span>
          <strong className="statValue">{pendingCount}</strong>
        </div>
        <div className="statCard statCard--danger">
          <div className="statIcon">✕</div>
          <span className="statLabel">Annulés</span>
          <strong className="statValue">{counts.CANCELLED}</strong>
        </div>
      </div>

      <div className="appointmentsSection">
        <div className="sectionHeader">
          <h2>📋 Rendez-vous reçus</h2>
          {pendingCount > 0 && <span className="badge" style={{margin:0}}>{pendingCount} en attente</span>}
        </div>
        <div className="filterTabs">
          {FILTERS.map((f) => (
            <button key={f.key} className={`filterTab${filter === f.key ? " filterTab--active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label} <span className="filterCount">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="emptyMessage">Aucun rendez-vous pour le moment.</p>
        ) : (
          <div className="appointmentList">
            {filtered.map((a) => (
              <div key={a.id} className="appointmentCard">
                <div>
                  <h3>{a.patient?.firstName} {a.patient?.lastName}</h3>
                  <div className="appointmentMeta">
                    <span>📅 {formatDate(a.startAt)}</span>
                    <span>📧 {a.patient?.email}</span>
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
    </div>
  );
}
