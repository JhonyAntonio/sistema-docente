"use client";

import { useEffect, useState } from "react";
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

export default function GestionAcademicaPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [areaId, setAreaId] = useState("");
  const [grado, setGrado] = useState("");
  const [seccion, setSeccion] = useState("");

  useEffect(() => {
    obtenerAreas();
    obtenerAsignaturas();
  }, []);

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

  const limpiarFormulario = () => {
    setAreaId("");
    setGrado("");
    setSeccion("");
    setModoEdicion(false);
    setIdEditando(null);
  };

  const abrirFormularioNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    limpiarFormulario();
  };

  const crearAsignatura = async () => {
    if (!areaId || !grado || !seccion) {
      alert("Completa todos los campos");
      return;
    }

    const { error } = await supabase.from("asignaturas").insert([
      {
        area_id: Number(areaId),
        grado,
        seccion,
        estado: "Activo",
      },
    ]);

    if (error) {
      console.log("Error al crear asignatura:", error);
      alert("No se pudo crear la asignatura");
    } else {
      alert("Asignatura creada correctamente");
      cerrarFormulario();
      obtenerAsignaturas();
    }
  };

  const editarAsignatura = (asignatura: Asignatura) => {
    setAreaId(String(asignatura.area_id));
    setGrado(asignatura.grado);
    setSeccion(asignatura.seccion);
    setIdEditando(asignatura.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const actualizarAsignatura = async () => {
    if (!areaId || !grado || !seccion) {
      alert("Completa todos los campos");
      return;
    }

    if (idEditando === null) {
      alert("No se encontró la asignatura");
      return;
    }

    const { error } = await supabase
      .from("asignaturas")
      .update({
        area_id: Number(areaId),
        grado,
        seccion,
      })
      .eq("id", idEditando);

    if (error) {
      console.log("Error al actualizar asignatura:", error);
      alert("No se pudo actualizar la asignatura");
    } else {
      alert("Asignatura actualizada correctamente");
      cerrarFormulario();
      obtenerAsignaturas();
    }
  };

  const eliminarAsignatura = async (id: number) => {
    const confirmar = confirm("¿Seguro que deseas eliminar esta asignatura?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("asignaturas")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("Error al eliminar asignatura:", error);
      alert("No se pudo eliminar la asignatura");
    } else {
      alert("Asignatura eliminada correctamente");
      obtenerAsignaturas();
    }
  };

  const obtenerNombreArea = (area_id: number) => {
    const area = areas.find((item) => item.id === area_id);
    return area ? area.nombre : "Área no encontrada";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f6f9",
        padding: "25px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, color: "#1e3c72" }}>Gestión Académica</h1>
        <p style={{ marginTop: "8px", color: "#666" }}>
          Crea asignaturas por área, grado y sección.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={abrirFormularioNuevo}
          style={{
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          + Crear Asignatura
        </button>
      </div>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#333" }}>Lista de Asignaturas</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e9f2ff" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Área</th>
              <th style={thStyle}>Grado</th>
              <th style={thStyle}>Sección</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acción</th>
            </tr>
          </thead>

          <tbody>
            {asignaturas.length > 0 ? (
              asignaturas.map((asig) => (
                <tr key={asig.id}>
                  <td style={tdStyle}>{asig.id}</td>
                  <td style={tdStyle}>{obtenerNombreArea(asig.area_id)}</td>
                  <td style={tdStyle}>{asig.grado}</td>
                  <td style={tdStyle}>{asig.seccion}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {asig.estado}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => editarAsignatura(asig)}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarAsignatura(asig.id)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={tdStyle} colSpan={6}>
                  No hay asignaturas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {mostrarFormulario && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              width: "700px",
              maxWidth: "95%",
              borderRadius: "14px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
              overflow: "hidden",
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
              }}
            >
              <h2 style={{ margin: 0 }}>
                {modoEdicion ? "Editar Asignatura" : "Crear Asignatura"}
              </h2>

              <button
                onClick={cerrarFormulario}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "25px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "18px",
                }}
              >
                <div>
                  <label style={labelStyle}>Área</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Seleccione un área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Grado</label>
                  <input
                    type="text"
                    value={grado}
                    onChange={(e) => setGrado(e.target.value)}
                    style={inputStyle}
                    placeholder="Ejemplo: Cuarto"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Sección</label>
                  <input
                    type="text"
                    value={seccion}
                    onChange={(e) => setSeccion(e.target.value)}
                    style={inputStyle}
                    placeholder="Ejemplo: A"
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "25px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={modoEdicion ? actualizarAsignatura : crearAsignatura}
                  style={{
                    backgroundColor: modoEdicion ? "#007bff" : "#17a2b8",
                    color: "white",
                    border: "none",
                    padding: "12px 22px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {modoEdicion ? "Actualizar" : "Guardar"}
                </button>

                <button
                  onClick={cerrarFormulario}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "12px 22px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "left" as const,
  color: "#333",
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  color: "#333",
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
};