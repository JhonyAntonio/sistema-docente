export default function DocenteHomePage() {
  return (
    <div>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, color: "#1e3c72" }}>Bienvenido al Panel Docente</h1>
        <p style={{ marginTop: "8px", color: "#666" }}>
          Selecciona una opción del menú para comenzar.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h3 style={cardTitle}>👨‍🎓 Estudiantes</h3>
          <p style={cardText}>Gestiona el registro de estudiantes del sistema.</p>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitle}>📝 Registro de Notas</h3>
          <p style={cardText}>Administra las calificaciones por estudiante.</p>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitle}>📅 Asistencia</h3>
          <p style={cardText}>Controla la asistencia diaria de los estudiantes.</p>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitle}>📘 Reportes</h3>
          <p style={cardText}>Consulta y visualiza información importante.</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const cardTitle = {
  margin: "0 0 10px 0",
  color: "#1e3c72",
};

const cardText = {
  margin: 0,
  color: "#666",
};