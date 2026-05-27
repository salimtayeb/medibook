"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import api from "@/lib/api";

export default function DocumentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const addToast = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("carte_vitale");

  async function loadDocs() {
    try {
      const response = await api("/api/documents");
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch {
      addToast("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadDocs();
  }, [user, authLoading]);

  async function handleUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById("docFile");
    const file = fileInput?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("medibook_token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", docName || file.name);
      formData.append("type", docType);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        addToast(data.message || "Erreur", "error");
        return;
      }

      addToast("Document ajouté");
      setDocName("");
      fileInput.value = "";
      loadDocs();
    } catch {
      addToast("Erreur lors de l'upload", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      await api(`/api/documents/${id}`, { method: "DELETE" });
      addToast("Document supprimé");
      loadDocs();
    } catch {
      addToast("Erreur", "error");
    }
  }

  if (authLoading || loading) {
    return (
      <main className="page">
        <section className="pageHeader">
          <p className="badge">Documents santé</p>
          <div className="skeleton skeletonText" />
        </section>
        <section className="appointmentsSection">
          <div className="skeleton skeletonCard" />
        </section>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="page">
      <section className="pageHeader">
        <p className="badge">Documents santé</p>
        <h1>Mes documents</h1>
        <p className="description">
          Ajoutez votre carte vitale, mutuelle, ordonnances et autres documents.
        </p>
      </section>

      <section className="appointmentsSection" style={{ marginBottom: 24 }}>
        <div className="sectionHeader">
          <h2>Ajouter un document</h2>
        </div>

        <form onSubmit={handleUpload} className="form">
          <div className="docTypeGrid">
            {[
              { value: "carte_vitale", label: "Carte Vitale" },
              { value: "mutuelle", label: "Mutuelle" },
              { value: "ordonnance", label: "Ordonnance" },
              { value: "analyse", label: "Analyse" },
              { value: "radio", label: "Radio/Imagerie" },
              { value: "other", label: "Autre" }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`docTypeBtn ${docType === opt.value ? "docTypeBtn--active" : ""}`}
                onClick={() => setDocType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label>
            Nom du document (optionnel)
            <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="ex: Carte vitale 2026" />
          </label>

          <label>
            Fichier (max 10 Mo)
            <input id="docFile" type="file" required />
          </label>

          <button type="submit" className="primaryButton" disabled={uploading}>
            {uploading ? <><Spinner /> Upload...</> : "Ajouter le document"}
          </button>
        </form>
      </section>

      <section className="appointmentsSection">
        <div className="sectionHeader">
          <h2>Mes documents ({documents.length})</h2>
        </div>

        {documents.length === 0 ? (
          <p className="emptyMessage">
            Aucun document pour le moment.
          </p>
        ) : (
          <div className="appointmentList">
            {documents.map((doc) => (
              <article key={doc.id} className="appointmentCard">
                <div>
                  <h3>{doc.name}</h3>
                  <p className="appointmentMeta">
                    {doc.type === "carte_vitale" && "Carte Vitale"}
                    {doc.type === "mutuelle" && "Mutuelle"}
                    {doc.type === "ordonnance" && "Ordonnance"}
                    {doc.type === "analyse" && "Analyse"}
                    {doc.type === "radio" && "Radio/Imagerie"}
                    {doc.type === "other" && "Autre"}
                    {doc.fileSize ? ` — ${(doc.fileSize / 1024).toFixed(0)} Ko` : ""}
                  </p>
                  <p className="appointmentMeta">
                    {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <button onClick={() => handleDelete(doc.id)} className="cancelButton">
                  Supprimer
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
