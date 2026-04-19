"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DocenteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

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

  const obtenerEstiloLink = (href: string): React.CSSProperties => {
    const activo = pathname === href;

    return {
      display: "block",
      padding: "13px 16px",
      borderRadius: "12px",
      backgroundColor: activo
        ? "rgba(255,255,255,0.28)"
        : "rgba(255,255,255,0.15)",
      color: "white",
      textDecoration: "none",
      fontSize: "15px",
      fontWeight: activo ? "700" : "500",
      border: activo ? "1px solid rgba(255,255,255,0.35)" : "1px solid transparent",
      boxShadow: activo ? "0 4px 10px rgba(0,0,0,0.12)" : "none",
      transition: "all 0.2s ease",
      WebkitTextFillColor: "white",
      opacity: 1,
    };
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
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 1000,
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
              color: "white",
              WebkitTextFillColor: "white",
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
              color: "white",
              WebkitTextFillColor: "white",
              opacity: 1,
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
            <Link href="/docente" style={obtenerEstiloLink("/docente")}>
              📊 Dashboard
            </Link>

            <Link
              href="/docente/gestion-academica"
              style={obtenerEstiloLink("/docente/gestion-academica")}
            >
              📚 Gestión Académica
            </Link>

            <Link
              href="/docente/estudiantes"
              style={obtenerEstiloLink("/docente/estudiantes")}
            >
              🧑‍🎓 Estudiantes
            </Link>

            <Link href="/docente/notas" style={obtenerEstiloLink("/docente/notas")}>
              📝 Registro de Notas
            </Link>

            <Link
              href="/docente/asistencia"
              style={obtenerEstiloLink("/docente/asistencia")}
            >
              🗓️ Asistencia
            </Link>

            <Link
              href="/docente/reportes"
              style={obtenerEstiloLink("/docente/reportes")}
            >
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
            border: "1px solid rgba(255,255,255,0.18)",
            padding: "12px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            marginTop: "18px",
            flexShrink: 0,
            WebkitTextFillColor: "white",
            opacity: 1,
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
          width: "calc(100% - 250px)",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}