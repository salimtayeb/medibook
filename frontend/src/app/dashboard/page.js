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

export default function PatientDashboard() {
  const { user, token, logout } = useAuth();
  const addToast = useToast();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (user && user.role !== "PATIENT") {
      const targets = { DOCTOR: "/doctor/dashboard", ADMIN: "/admin/dashboard" };
      router.push(targets[user.role] || "/login");
      return;
    }
    if (!user) return;
    loadAppointments();
  }, [user, token]);

  async function loadAppointments() {
    try {
      const res = await api("/api/appointments/me");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch { /* handled by api helper */ }
    finally { setLoading(false); }
  }

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

  return (
    <div className="page">
      <div className="dashboardHeader">
        <div>
          <h1 style={{margin:0}}>Bonjour, {user?.firstName} 👋</h1>
          <p style={{color:"var(--text-secondary)",marginTop:6}}>Bienvenue sur votre tableau de bord</p>
        </div>
        <button className="navbarLogout" onClick={logout}>
          <span>✕</span> Déconnexion
        </button>
      </div>

      <div className="statsGrid">
        <div className="statCard statCard--primary">
          <div className="statIcon">📅</div>
          <span className="statLabel">Total Rendez-vous</span>
          <strong className="statValue">{appointments.length}</strong>
        </div>
        <div className="statCard statCard--warning">
          <div className="statIcon">⏳</div>
          <span className="statLabel">En attente</span>
          <strong className="statValue">{counts.PENDING}</strong>
        </div>
        <div className="statCard statCard--success">
          <div className="statIcon">✅</div>
          <span className="statLabel">Confirmés</span>
          <strong className="statValue">{counts.CONFIRMED}</strong>
        </div>
        <div className="statCard statCard--danger">
          <div className="statIcon">✕</div>
          <span className="statLabel">Annulés</span>
          <strong className="statValue">{counts.CANCELLED}</strong>
        </div>
      </div>

      <div className="quickActions">
        <Link href="/doctors" className="quickAction">
          <span className="qaIcon">👨‍⚕️</span>
          Nouveau rendez-vous
        </Link>
        <Link href="/pharmacies" className="quickAction">
          <span className="qaIcon">💊</span>
          Pharmacies
        </Link>
        <Link href="/documents" className="quickAction">
          <span className="qaIcon">📄</span>
          Mes documents
        </Link>
        <Link href="/profile" className="quickAction">
          <span className="qaIcon">👤</span>
          Mon profil
        </Link>
      </div>

      <div className="appointmentsSection">
        <div className="sectionHeader">
          <h2>📋 Mes rendez-vous</h2>
        </div>
        <div className="filterTabs">
          {FILTERS.map((f) => (
            <button key={f.key} className={`filterTab${filter === f.key ? " filterTab--active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
              <span className="filterCount">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="emptyMessage">Aucun rendez-vous {filter !== "ALL" ? STATUS_LABELS[filter]?.toLowerCase() : ""} pour le moment.</p>
        ) : (
          <div className="appointmentList">
            {filtered.map((a) => (
              <div key={a.id} className="appointmentCard">
                <div>
                  <h3>Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}</h3>
                  <div className="appointmentMeta">
                    <span>📅 {formatDate(a.startAt)}</span>
                    {a.reason && <span>💬 {a.reason}</span>}
                    <span>🏥 {a.doctor?.specialty}</span>
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
                  {a.status === "PENDING" && (
                    <button className="cancelButton" onClick={() => handleCancel(a.id)}>Annuler</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
