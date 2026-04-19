"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Area = {
  id: number;
  nombre: string;
  estado: string;
};

type Asignatura = {
  id: number;
  area_id: number;
  grado: string;
  seccion: string;
  estado: string;
};

type Estudiante = {
  id: number;
  asignatura_id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  grado: string;
  seccion: string;
  estado: string;
};

type Asistencia = {
  id: number;
  estudiante_id: number;
  asignatura_id: number;
  fecha: string;
  estado: "A" | "T" | "F" | "J" | "I";
  created_at: string;
  updated_at: string;
};

export default function AsistenciaPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asistenciasHoy, setAsistenciasHoy] = useState<Asistencia[]>([]);

  const [asignaturaSeleccionadaId, setAsignaturaSeleccionadaId] = useState("");
  const [mostrarPrevisualizacion, setMostrarPrevisualizacion] = useState(false);
  const [mostrarGestionAsistencia, setMostrarGestionAsistencia] =
    useState(false);

  const hoy = new Date();
  const fechaActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(hoy.getDate()).padStart(2, "0")}`;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaActual);
  const [nuevaFechaGestion, setNuevaFechaGestion] = useState(fechaActual);

  const [estadoPorEstudiante, setEstadoPorEstudiante] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    obtenerAreas();
    obtenerAsignaturas();
  }, []);

  useEffect(() => {
    if (!asignaturaSeleccionadaId) {
      setEstudiantes([]);
      setAsistenciasHoy([]);
      setEstadoPorEstudiante({});
      return;
    }

    cargarAsistenciaDelDia();
  }, [asignaturaSeleccionadaId, fechaSeleccionada]);

  const obtenerAreas = async () => {
    const { data, error } = await supabase
      .from("areas")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.log("Error al obtener áreas:", error);
    } else {
      setAreas((data as Area[]) || []);
    }
  };

  const obtenerAsignaturas = async () => {
    const { data, error } = await supabase
      .from("asignaturas")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("Error al obtener asignaturas:", error);
    } else {
      setAsignaturas((data as Asignatura[]) || []);
    }
  };

  const cargarAsistenciaDelDia = async () => {
    const asignaturaId = Number(asignaturaSeleccionadaId);

    const { data: estudiantesData, error: errorEstudiantes } = await supabase
      .from("estudiantes")
      .select("*")
      .eq("asignatura_id", asignaturaId)
      .order("apellidos", { ascending: true });

    if (errorEstudiantes) {
      console.log("Error al obtener estudiantes:", errorEstudiantes);
      setEstudiantes([]);
      return;
    }

    setEstudiantes((estudiantesData as Estudiante[]) || []);

    const { data: asistenciaData, error: errorAsistencia } = await supabase
      .from("asistencias")
      .select("*")
      .eq("asignatura_id", asignaturaId)
      .eq("fecha", fechaSeleccionada);

    if (errorAsistencia) {
      console.log("Error al obtener asistencia del día:", errorAsistencia);
      setAsistenciasHoy([]);
      return;
    }

    const lista = (asistenciaData as Asistencia[]) || [];
    setAsistenciasHoy(lista);

    const mapa: Record<number, string> = {};
    lista.forEach((item) => {
      mapa[item.estudiante_id] = item.estado;
    });
    setEstadoPorEstudiante(mapa);
  };

  const obtenerNombreArea = (area_id: number) => {
    const area = areas.find((item) => item.id === area_id);
    return area ? area.nombre : "Área no encontrada";
  };

  const asignaturaSeleccionada = asignaturas.find(
    (item) => item.id === Number(asignaturaSeleccionadaId)
  );

  const cambiarEstado = (estudianteId: number, estado: string) => {
    setEstadoPorEstudiante((prev) => ({
      ...prev,
      [estudianteId]: estado,
    }));
  };

  const guardarAsistencia = async () => {
    if (!asignaturaSeleccionadaId) {
      alert("Selecciona una asignatura");
      return;
    }

    if (estudiantes.length === 0) {
      alert("No hay estudiantes en esta asignatura");
      return;
    }

    for (const estudiante of estudiantes) {
      const estado = estadoPorEstudiante[estudiante.id];
      if (!estado) continue;

      const { error } = await supabase.from("asistencias").upsert(
        {
          estudiante_id: estudiante.id,
          asignatura_id: Number(asignaturaSeleccionadaId),
          fecha: fechaSeleccionada,
          estado,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "estudiante_id,asignatura_id,fecha",
        }
      );

      if (error) {
        console.log("Error al guardar asistencia:", error);
        alert("No se pudo guardar una de las asistencias");
        return;
      }
    }

    await cargarAsistenciaDelDia();
    alert("Asistencia guardada correctamente");
  };

  const abrirGestionAsistencia = () => {
    if (!asignaturaSeleccionadaId) {
      alert("Selecciona una asignatura");
      return;
    }

    setNuevaFechaGestion(fechaSeleccionada);
    setMostrarGestionAsistencia(true);
  };

  const actualizarFechaAsistencia = async () => {
    if (!asignaturaSeleccionadaId) {
      alert("Selecciona una asignatura");
      return;
    }

    if (!nuevaFechaGestion) {
      alert("Selecciona una nueva fecha");
      return;
    }

    if (asistenciasHoy.length === 0) {
      alert("No hay asistencia registrada para editar en esta fecha");
      return;
    }

    if (nuevaFechaGestion === fechaSeleccionada) {
      alert("La nueva fecha es igual a la fecha actual");
      return;
    }

    const confirmar = confirm(
      `¿Seguro que deseas mover la asistencia del ${fechaSeleccionada} al ${nuevaFechaGestion}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("asistencias")
      .update({
        fecha: nuevaFechaGestion,
        updated_at: new Date().toISOString(),
      })
      .eq("asignatura_id", Number(asignaturaSeleccionadaId))
      .eq("fecha", fechaSeleccionada);

    if (error) {
      console.log("Error al actualizar fecha de asistencia:", error);
      alert("No se pudo actualizar la fecha de la asistencia");
      return;
    }

    setFechaSeleccionada(nuevaFechaGestion);
    setMostrarGestionAsistencia(false);
    alert("Fecha de asistencia actualizada correctamente");
  };

  const eliminarAsistencia = async () => {
    if (!asignaturaSeleccionadaId) {
      alert("Selecciona una asignatura");
      return;
    }

    if (asistenciasHoy.length === 0) {
      alert("No hay asistencia registrada para eliminar en esta fecha");
      return;
    }

    const confirmar = confirm(
      `¿Seguro que deseas eliminar toda la asistencia del ${fechaSeleccionada}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("asistencias")
      .delete()
      .eq("asignatura_id", Number(asignaturaSeleccionadaId))
      .eq("fecha", fechaSeleccionada);

    if (error) {
      console.log("Error al eliminar asistencia:", error);
      alert("No se pudo eliminar la asistencia");
      return;
    }

    setEstadoPorEstudiante({});
    await cargarAsistenciaDelDia();
    setMostrarGestionAsistencia(false);
    alert("Asistencia eliminada correctamente");
  };

  const resumenDia = useMemo(() => {
    const valores = Object.values(estadoPorEstudiante).filter(Boolean);

    const asistio = valores.filter((v) => v === "A").length;
    const tardanza = valores.filter((v) => v === "T").length;
    const justificado = valores.filter((v) => v === "J").length;
    const falta = valores.filter((v) => v === "F").length;
    const institucional = valores.filter((v) => v === "I").length;

    const total = asistio + tardanza + justificado + falta + institucional;
    const computables = asistio + tardanza;
    const porcentaje =
      total > 0 ? Number(((computables / total) * 100).toFixed(0)) : 0;

    return {
      asistio,
      tardanza,
      justificado,
      falta,
      institucional,
      porcentaje,
    };
  }, [estadoPorEstudiante]);

  const renderTabla = (soloLectura: boolean) => (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          minWidth: "700px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#eef4ff" }}>
            <th style={thStyle}>DNI</th>
            <th style={thStyle}>Estudiante</th>
            <th style={thStyle}>Estado de la fecha</th>
          </tr>
        </thead>

        <tbody>
          {estudiantes.length > 0 ? (
            estudiantes.map((estudiante) => (
              <tr key={estudiante.id}>
                <td style={tdStyle}>{estudiante.dni}</td>
                <td style={tdStyle}>
                  {estudiante.apellidos}, {estudiante.nombres}
                </td>
                <td style={tdStyle}>
                  {soloLectura ? (
                    <span style={{ color: "#111", fontWeight: 600 }}>
                      {estadoPorEstudiante[estudiante.id] ?? "-"}
                    </span>
                  ) : (
                    <select
                      value={estadoPorEstudiante[estudiante.id] ?? ""}
                      onChange={(e) =>
                        cambiarEstado(estudiante.id, e.target.value)
                      }
                      style={selectStyle}
                    >
                      <option value="">-</option>
                      <option value="A">A</option>
                      <option value="T">T</option>
                      <option value="J">J</option>
                      <option value="F">F</option>
                      <option value="I">I</option>
                    </select>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={tdStyle} colSpan={3}>
                No hay estudiantes registrados en esta asignatura
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f6f9",
        padding: "25px",
      }}
    >
      <div style={cardStyle}>
        <h1 style={{ margin: 0, color: "#1e3c72" }}>Registro de Asistencia</h1>
        <p style={{ marginTop: "8px", color: "#666" }}>
          Registra la asistencia por fecha de la asignatura seleccionada.
        </p>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            alignItems: "end",
          }}
        >
          <div>
            <label style={labelStyle}>Asignatura creada</label>
            <select
              value={asignaturaSeleccionadaId}
              onChange={(e) => setAsignaturaSeleccionadaId(e.target.value)}
              style={selectStyle}
            >
              <option value="">Seleccione una asignatura</option>
              {asignaturas.map((asig) => (
                <option key={asig.id} value={asig.id}>
                  {obtenerNombreArea(asig.area_id)} - {asig.grado} {asig.seccion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fecha</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              style={{
                ...inputStyle,
                WebkitTextFillColor: "#111",
                }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={guardarAsistencia} style={btnPrimary}>
              Guardar asistencia
            </button>

            <button
              onClick={() => {
                if (!asignaturaSeleccionadaId) {
                  alert("Selecciona una asignatura");
                  return;
                }
                setMostrarPrevisualizacion(true);
              }}
              style={btnGray}
            >
              Previsualizar
            </button>

            <button onClick={abrirGestionAsistencia} style={btnWarning}>
              Editar / Eliminar
            </button>
          </div>
        </div>
      </div>

      {asignaturaSeleccionada && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: "#333" }}>Asignatura seleccionada</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "18px",
              marginTop: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Área</label>
              <input
                type="text"
                value={obtenerNombreArea(asignaturaSeleccionada.area_id)}
                readOnly
                style={readOnlyStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Grado</label>
              <input
                type="text"
                value={asignaturaSeleccionada.grado}
                readOnly
                style={readOnlyStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Sección</label>
              <input
                type="text"
                value={asignaturaSeleccionada.seccion}
                readOnly
                style={readOnlyStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Cantidad de estudiantes</label>
              <input
                type="text"
                value={String(estudiantes.length)}
                readOnly
                style={readOnlyStyle}
              />
            </div>
          </div>
        </div>
      )}

      {asignaturaSeleccionada && (
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: "#333" }}>Asistencia de la fecha</h2>
              <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                {fechaSeleccionada}
              </p>
            </div>
          </div>

          {renderTabla(false)}
        </div>
      )}

      {asignaturaSeleccionada && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: "#333" }}>Resumen del día</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "12px",
              marginTop: "15px",
            }}
          >
            <div style={summaryCard("#d1fae5")}>
              <strong style={{ color: "#111" }}>A</strong>
              <div style={{ color: "#111" }}>{resumenDia.asistio}</div>
            </div>
            <div style={summaryCard("#fef3c7")}>
              <strong style={{ color: "#111" }}>T</strong>
              <div style={{ color: "#111" }}>{resumenDia.tardanza}</div>
            </div>
            <div style={summaryCard("#dbeafe")}>
              <strong style={{ color: "#111" }}>J</strong>
              <div style={{ color: "#111" }}>{resumenDia.justificado}</div>
            </div>
            <div style={summaryCard("#fee2e2")}>
              <strong style={{ color: "#111" }}>F</strong>
              <div style={{ color: "#111" }}>{resumenDia.falta}</div>
            </div>
            <div style={summaryCard("#ede9fe")}>
              <strong style={{ color: "#111" }}>I</strong>
              <div style={{ color: "#111" }}>{resumenDia.institucional}</div>
            </div>
            <div style={summaryCard("#dcfce7")}>
              <strong style={{ color: "#111" }}>%</strong>
              <div style={{ color: "#111" }}>{resumenDia.porcentaje}%</div>
            </div>
          </div>
        </div>
      )}

      {mostrarPrevisualizacion && asignaturaSeleccionada && (
        <div style={overlayStyle}>
          <div
            style={{
              backgroundColor: "white",
              width: "900px",
              maxWidth: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "14px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                padding: "18px 22px",
                backgroundColor: "#f1f5f9",
                borderBottom: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: "#111" }}>
                  Previsualización de asistencia
                </h2>
                <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                  {obtenerNombreArea(asignaturaSeleccionada.area_id)} -{" "}
                  {asignaturaSeleccionada.grado} {asignaturaSeleccionada.seccion} -{" "}
                  {fechaSeleccionada}
                </p>
              </div>

              <button
                onClick={() => setMostrarPrevisualizacion(false)}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "25px" }}>
              {renderTabla(true)}

              <div style={{ marginTop: "20px" }}>
                <h3 style={{ marginBottom: "12px", color: "#111" }}>
                  Resumen del día
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div style={summaryCard("#d1fae5")}>
                    <strong style={{ color: "#111" }}>A</strong>
                    <div style={{ color: "#111" }}>{resumenDia.asistio}</div>
                  </div>
                  <div style={summaryCard("#fef3c7")}>
                    <strong style={{ color: "#111" }}>T</strong>
                    <div style={{ color: "#111" }}>{resumenDia.tardanza}</div>
                  </div>
                  <div style={summaryCard("#dbeafe")}>
                    <strong style={{ color: "#111" }}>J</strong>
                    <div style={{ color: "#111" }}>{resumenDia.justificado}</div>
                  </div>
                  <div style={summaryCard("#fee2e2")}>
                    <strong style={{ color: "#111" }}>F</strong>
                    <div style={{ color: "#111" }}>{resumenDia.falta}</div>
                  </div>
                  <div style={summaryCard("#ede9fe")}>
                    <strong style={{ color: "#111" }}>I</strong>
                    <div style={{ color: "#111" }}>{resumenDia.institucional}</div>
                  </div>
                  <div style={summaryCard("#dcfce7")}>
                    <strong style={{ color: "#111" }}>%</strong>
                    <div style={{ color: "#111" }}>{resumenDia.porcentaje}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarGestionAsistencia && asignaturaSeleccionada && (
        <div style={overlayStyle}>
          <div
            style={{
              backgroundColor: "white",
              width: "820px",
              maxWidth: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "14px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                padding: "18px 22px",
                backgroundColor: "#f1f5f9",
                borderBottom: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: "#111" }}>
                  Editar o eliminar asistencia
                </h2>
                <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                  {obtenerNombreArea(asignaturaSeleccionada.area_id)} -{" "}
                  {asignaturaSeleccionada.grado} {asignaturaSeleccionada.seccion}
                </p>
              </div>

              <button
                onClick={() => setMostrarGestionAsistencia(false)}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "25px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label style={labelStyle}>Fecha actual registrada</label>
                  <input
                    type="text"
                    value={fechaSeleccionada}
                    readOnly
                    style={readOnlyStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Nueva fecha</label>
                  <input
                    type="date"
                    value={nuevaFechaGestion}
                    onChange={(e) => setNuevaFechaGestion(e.target.value)}
                    style={{
                      ...inputStyle,
                      WebkitTextFillColor: "#111",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "20px",
                  color: "#334155",
                }}
              >
                <p style={{ margin: 0 }}>
                  Aquí puedes cambiar la fecha de toda la asistencia registrada
                  o eliminar completamente la asistencia de esta fecha.
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>{renderTabla(true)}</div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button onClick={actualizarFechaAsistencia} style={btnPrimary}>
                  Guardar nueva fecha
                </button>

                <button onClick={eliminarAsistencia} style={btnDanger}>
                  Eliminar asistencia
                </button>

                <button
                  onClick={() => setMostrarGestionAsistencia(false)}
                  style={btnGray}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "bold",
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  boxSizing: "border-box" as const,
  color: "#111",
  backgroundColor: "#ffffff",
  opacity: 1,
  WebkitTextFillColor: "#111",
  fontSize: "16px",
};

const readOnlyStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  boxSizing: "border-box" as const,
  backgroundColor: "#f1f5f9",
  color: "#111",
  opacity: 1,
  WebkitTextFillColor: "#111",
  fontSize: "16px",
};

const selectStyle = {
  width: "100%",
  minWidth: "250px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  boxSizing: "border-box" as const,
  color: "#111",
  backgroundColor: "#ffffff",
  opacity: 1,
  WebkitTextFillColor: "#111",
  fontSize: "16px",
};

const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#333",
  backgroundColor: "#eef4ff",
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#333",
  verticalAlign: "middle" as const,
};

const btnPrimary = {
  backgroundColor: "#17a2b8",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnGray = {
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnWarning = {
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnDanger = {
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "12px",
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  fontSize: "22px",
  cursor: "pointer",
  color: "#666",
  fontWeight: "bold",
};

const summaryCard = (backgroundColor: string) => ({
  backgroundColor,
  borderRadius: "10px",
  padding: "14px",
  textAlign: "center" as const,
  fontSize: "18px",
  color: "#111",
  fontWeight: "bold",
  opacity: 1,
  WebkitTextFillColor: "#111",
});