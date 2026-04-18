"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DocenteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const cerrarSesion = async () => {
    const confirmar = window.confirm("¿Seguro que deseas cerrar sesión?");
    if (!confirmar) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <aside
        style={{
          width: "250px",
          height: "100vh",
          background: "linear-gradient(180deg, #1e3c72, #2a5298)",
          color: "white",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "14px 12px",
          boxSizing: "border-box",
        }}
      >
        <div>
          <h2
            style={{
              textAlign: "center",
              margin: 0,
              marginBottom: "16px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            Panel Docente
          </h2>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              marginBottom: "16px",
            }}
          />

          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              padding: "14px",
              borderRadius: "12px",
              marginBottom: "14px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            🧑‍🏫 Administrador
          </div>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Link href="/docente" style={linkBase}>
              📊 Dashboard
            </Link>

            <Link href="/docente/gestion-academica" style={linkBase}>
              📚 Gestión Académica
            </Link>

            <Link href="/docente/estudiantes" style={linkBase}>
              🧑‍🎓 Estudiantes
            </Link>

            <Link href="/docente/notas" style={linkBase}>
              📝 Registro de Notas
            </Link>

            <Link href="/docente/asistencia" style={linkBase}>
              🗓️ Asistencia
            </Link>

            <Link href="/docente/reportes" style={linkBase}>
              📘 Reportes
            </Link>
          </nav>
        </div>

        <button
          onClick={cerrarSesion}
          style={{
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          🚪 Salir
        </button>
      </aside>

      <main
        style={{
          marginLeft: "250px",
          flex: 1,
          padding: "25px",
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}

const linkBase: React.CSSProperties = {
  display: "block",
  padding: "13px 16px",
  borderRadius: "12px",
  backgroundColor: "rgba(255,255,255,0.15)",
  color: "white",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "500",
};