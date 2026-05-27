"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("medibook_theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("medibook_theme", next ? "dark" : "light");
  }

  return (
    <nav className="navbar">
      <div className="navbarInner">
        <Link href="/" className="navbarLogo">MediBook</Link>
        <div className="navbarLinks">
          <Link href="/doctors">Médecins</Link>
          <Link href="/pharmacies">Pharmacies</Link>

          {token && user && (
            <>
              {user.role === "PATIENT" && (
                <>
                  <Link href="/dashboard">Rendez-vous</Link>
                  <Link href="/documents" className="navIconLink" title="Documents">📄</Link>
                  <Link href="/profile" className="navIconLink" title="Profil">👤</Link>
                </>
              )}
              {user.role === "DOCTOR" && (
                <Link href="/doctor/dashboard">Espace médecin</Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin/dashboard">Administration</Link>
              )}
              {user.role === "PATIENT" && (
                <Link href="/profile" className="navIconLink" title="Profil">👤</Link>
              )}
            </>
          )}

          <button className="themeToggle" onClick={toggleTheme} title={dark ? "Mode clair" : "Mode sombre"}>
            {dark ? "☀️" : "🌙"}
          </button>

          {token && user ? (
            <button className="navbarLogout" onClick={logout}>
              <span className="navLogoutName">{user.firstName}</span>
              <span>✕</span>
            </button>
          ) : (
            <>
              <Link href="/login">Connexion</Link>
              <Link href="/register" className="navbarRegister">Inscription</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
