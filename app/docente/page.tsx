"use client";

import { useRouter } from "next/navigation";

export default function DocenteHomePage() {
  const router = useRouter();

  const ir = (ruta: string) => {
    router.push(ruta);
  };

  return (
    <div>
      <div style={headerCard}>
        <h1 style={titleStyle}>Bienvenido al Panel Docente</h1>
        <p style={subtitleStyle}>
          Selecciona una opción del menú para comenzar.
        </p>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle} onClick={() => ir("/docente/estudiantes")}>
          <h3 style={cardTitle}>👨‍🎓 Estudiantes</h3>
          <p style={cardText}>
            Gestiona el registro de estudiantes del sistema.
          </p>
        </div>

        <div style={cardStyle} onClick={() => ir("/docente/notas")}>
          <h3 style={cardTitle}>📝 Registro de Notas</h3>
          <p style={cardText}>
            Administra las calificaciones por estudiante.
          </p>
        </div>

        <div style={cardStyle} onClick={() => ir("/docente/asistencia")}>
          <h3 style={cardTitle}>📅 Asistencia</h3>
          <p style={cardText}>
            Controla la asistencia diaria de los estudiantes.
          </p>
        </div>

        <div style={cardStyle} onClick={() => ir("/docente/reportes")}>
          <h3 style={cardTitle}>📘 Reportes</h3>
          <p style={cardText}>
            Consulta y visualiza información importante.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== ESTILOS ===== */

const headerCard = {
  backgroundColor: "white",
  borderRadius: "14px",
  padding: "22px",
  marginBottom: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const titleStyle = {
  margin: 0,
  color: "#1e3c72",
  WebkitTextFillColor: "#1e3c72",
};

const subtitleStyle = {
  marginTop: "8px",
  color: "#555",
  WebkitTextFillColor: "#555",
  opacity: 1,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  border: "1px solid #eee",
};

const cardTitle = {
  margin: "0 0 10px 0",
  color: "#1e3c72",
  WebkitTextFillColor: "#1e3c72",
};

const cardText = {
  margin: 0,
  color: "#555",
  WebkitTextFillColor: "#555",
  opacity: 1,
};