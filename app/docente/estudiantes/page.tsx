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

export default function EstudiantesPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] =
    useState<Asignatura | null>(null);

  const [dni, setDni] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [grado, setGrado] = useState("");
  const [seccion, setSeccion] = useState("");
  const [estado, setEstado] = useState("Activo");

  useEffect(() => {
    obtenerAreas();
    obtenerAsignaturas();
    obtenerEstudiantes();
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

  const obtenerEstudiantes = async () => {
    const { data, error } = await supabase
      .from("estudiantes")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("Error al obtener estudiantes:", error);
    } else {
      setEstudiantes((data as Estudiante[]) || []);
    }
  };

  const obtenerNombreArea = (area_id: number) => {
    const area = areas.find((item) => item.id === area_id);
    return area ? area.nombre : "Área no encontrada";
  };

  const limpiarFormulario = () => {
    setDni("");
    setNombres("");
    setApellidos("");
    setTelefono("");
    setGrado("");
    setSeccion("");
    setEstado("Activo");
    setModoEdicion(false);
    setIdEditando(null);
    setAsignaturaSeleccionada(null);
  };

  const abrirFormularioNuevo = (asignatura: Asignatura) => {
    limpiarFormulario();
    setAsignaturaSeleccionada(asignatura);
    setGrado(asignatura.grado);
    setSeccion(asignatura.seccion);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    limpiarFormulario();
  };

  const agregarEstudiante = async () => {
    if (
      !asignaturaSeleccionada ||
      !dni ||
      !nombres ||
      !apellidos ||
      !telefono ||
      !grado ||
      !seccion ||
      !estado
    ) {
      alert("Completa todos los campos");
      return;
    }

    if (dni.trim().length !== 8) {
      alert("El DNI debe tener 8 dígitos");
      return;
    }

    try {
      const dniLimpio = dni.trim();
      const nombresLimpios = nombres.trim();
      const apellidosLimpios = apellidos.trim();
      const telefonoLimpio = telefono.trim();
      const correoGenerado = `${dniLimpio}@pva.edu.pe`;

      // Verificar si ya existe el estudiante por DNI
      const { data: estudianteExistente, error: errorBusquedaEstudiante } =
        await supabase
          .from("estudiantes")
          .select("id")
          .eq("dni", dniLimpio)
          .maybeSingle();

      if (errorBusquedaEstudiante) {
        console.log("Error al verificar estudiante:", errorBusquedaEstudiante);
        alert("No se pudo verificar si el estudiante ya existe");
        return;
      }

      if (estudianteExistente) {
        alert("Ya existe un estudiante registrado con ese DNI");
        return;
      }

      // Verificar si ya existe usuario con ese DNI
      const { data: usuarioExistente, error: errorBusquedaUsuario } =
        await supabase
          .from("usuarios")
          .select("id")
          .eq("dni", dniLimpio)
          .maybeSingle();

      if (errorBusquedaUsuario) {
        console.log("Error al verificar usuario:", errorBusquedaUsuario);
        alert("No se pudo verificar si el usuario ya existe");
        return;
      }

      if (usuarioExistente) {
        alert("Ya existe una cuenta creada con ese DNI");
        return;
      }

      // Insertar estudiante
      const { data: nuevoEstudiante, error: errorEstudiante } = await supabase
        .from("estudiantes")
        .insert([
          {
            asignatura_id: asignaturaSeleccionada.id,
            dni: dniLimpio,
            nombres: nombresLimpios,
            apellidos: apellidosLimpios,
            telefono: telefonoLimpio,
            grado,
            seccion,
            estado,
          },
        ])
        .select()
        .single();

      if (errorEstudiante || !nuevoEstudiante) {
        console.log("Error al guardar estudiante:", errorEstudiante);
        alert("No se pudo guardar el estudiante");
        return;
      }

      // Crear usuario automático para el estudiante
      const { error: errorUsuario } = await supabase.from("usuarios").insert([
        {
          dni: dniLimpio,
          correo: correoGenerado,
          password: dniLimpio,
          rol: "estudiante",
          estudiante_id: nuevoEstudiante.id,
          estado: "Activo",
          debe_cambiar_clave: true,
        },
      ]);

      if (errorUsuario) {
        console.log("Error al crear usuario del estudiante:", errorUsuario);
        alert(
          "El estudiante se guardó, pero no se pudo crear su cuenta automáticamente"
        );
        cerrarFormulario();
        obtenerEstudiantes();
        return;
      }

      alert(
        `Estudiante guardado correctamente. Usuario: ${dniLimpio} | Contraseña inicial: ${dniLimpio}`
      );
      cerrarFormulario();
      obtenerEstudiantes();
    } catch (error) {
      console.log("Error inesperado al guardar estudiante:", error);
      alert("Ocurrió un error inesperado");
    }
  };

  const editarEstudiante = (estudiante: Estudiante) => {
    const asignatura = asignaturas.find(
      (item) => item.id === estudiante.asignatura_id
    );

    if (!asignatura) {
      alert("No se encontró la asignatura de este estudiante");
      return;
    }

    setAsignaturaSeleccionada(asignatura);
    setDni(estudiante.dni);
    setNombres(estudiante.nombres);
    setApellidos(estudiante.apellidos);
    setTelefono(estudiante.telefono);
    setGrado(estudiante.grado);
    setSeccion(estudiante.seccion);
    setEstado(estudiante.estado);
    setIdEditando(estudiante.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const actualizarEstudiante = async () => {
    if (
      idEditando === null ||
      !asignaturaSeleccionada ||
      !dni ||
      !nombres ||
      !apellidos ||
      !telefono ||
      !grado ||
      !seccion ||
      !estado
    ) {
      alert("Completa todos los campos");
      return;
    }

    if (dni.trim().length !== 8) {
      alert("El DNI debe tener 8 dígitos");
      return;
    }

    try {
      const dniLimpio = dni.trim();
      const nombresLimpios = nombres.trim();
      const apellidosLimpios = apellidos.trim();
      const telefonoLimpio = telefono.trim();
      const correoGenerado = `${dniLimpio}@pva.edu.pe`;

      // Obtener estudiante actual
      const { data: estudianteActual, error: errorEstudianteActual } =
        await supabase
          .from("estudiantes")
          .select("id, dni")
          .eq("id", idEditando)
          .single();

      if (errorEstudianteActual || !estudianteActual) {
        console.log("Error al obtener estudiante actual:", errorEstudianteActual);
        alert("No se pudo obtener el estudiante actual");
        return;
      }

      // Validar si el nuevo DNI ya existe en otro estudiante
      if (estudianteActual.dni !== dniLimpio) {
        const { data: estudianteConMismoDni, error: errorValidacionDni } =
          await supabase
            .from("estudiantes")
            .select("id")
            .eq("dni", dniLimpio)
            .neq("id", idEditando)
            .maybeSingle();

        if (errorValidacionDni) {
          console.log("Error al validar DNI repetido:", errorValidacionDni);
          alert("No se pudo validar el DNI");
          return;
        }

        if (estudianteConMismoDni) {
          alert("Ya existe otro estudiante con ese DNI");
          return;
        }

        const { data: usuarioConMismoDni, error: errorUsuarioDni } =
          await supabase
            .from("usuarios")
            .select("id")
            .eq("dni", dniLimpio)
            .neq("estudiante_id", idEditando)
            .maybeSingle();

        if (errorUsuarioDni) {
          console.log("Error al validar usuario repetido:", errorUsuarioDni);
          alert("No se pudo validar la cuenta del estudiante");
          return;
        }

        if (usuarioConMismoDni) {
          alert("Ya existe una cuenta registrada con ese DNI");
          return;
        }
      }

      // Actualizar estudiante
      const { error } = await supabase
        .from("estudiantes")
        .update({
          dni: dniLimpio,
          nombres: nombresLimpios,
          apellidos: apellidosLimpios,
          telefono: telefonoLimpio,
          grado,
          seccion,
          estado,
        })
        .eq("id", idEditando);

      if (error) {
        console.log("Error al actualizar estudiante:", error);
        alert("No se pudo actualizar el estudiante");
        return;
      }

      // Actualizar usuario relacionado
      const { error: errorUsuario } = await supabase
        .from("usuarios")
        .update({
          dni: dniLimpio,
          correo: correoGenerado,
          estado,
        })
        .eq("estudiante_id", idEditando)
        .eq("rol", "estudiante");

      if (errorUsuario) {
        console.log("Error al actualizar usuario del estudiante:", errorUsuario);
        alert(
          "El estudiante se actualizó, pero no se pudo actualizar su cuenta de acceso"
        );
        cerrarFormulario();
        obtenerEstudiantes();
        return;
      }

      alert("Estudiante actualizado correctamente");
      cerrarFormulario();
      obtenerEstudiantes();
    } catch (error) {
      console.log("Error inesperado al actualizar estudiante:", error);
      alert("Ocurrió un error inesperado");
    }
  };

  const eliminarEstudiante = async (id: number) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este estudiante?");
    if (!confirmar) return;

    try {
      // Eliminar usuario relacionado
      const { error: errorUsuario } = await supabase
        .from("usuarios")
        .delete()
        .eq("estudiante_id", id)
        .eq("rol", "estudiante");

      if (errorUsuario) {
        console.log("Error al eliminar usuario del estudiante:", errorUsuario);
        alert("No se pudo eliminar la cuenta del estudiante");
        return;
      }

      // Eliminar estudiante
      const { error } = await supabase.from("estudiantes").delete().eq("id", id);

      if (error) {
        console.log("Error al eliminar estudiante:", error);
        alert("No se pudo eliminar el estudiante");
      } else {
        alert("Estudiante eliminado correctamente");
        obtenerEstudiantes();
      }
    } catch (error) {
      console.log("Error inesperado al eliminar estudiante:", error);
      alert("Ocurrió un error inesperado");
    }
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
        <h1 style={{ margin: 0, color: "#1e3c72" }}>Gestión de Estudiantes</h1>
        <p style={{ marginTop: "8px", color: "#666" }}>
          Administra estudiantes por área, grado y sección.
        </p>
      </div>

      {asignaturas.length === 0 ? (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#333" }}>
            No hay asignaturas registradas. Primero crea una asignatura en
            Gestión Académica.
          </p>
        </div>
      ) : (
        asignaturas.map((asignatura) => {
          const estudiantesDeAsignatura = estudiantes.filter(
            (est) => est.asignatura_id === asignatura.id
          );

          return (
            <div
              key={asignatura.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, color: "#333" }}>
                    {obtenerNombreArea(asignatura.area_id)}
                  </h2>
                  <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                    {asignatura.grado} - {asignatura.seccion}
                  </p>
                </div>

                <button
                  onClick={() => abrirFormularioNuevo(asignatura)}
                  style={{
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Agregar Estudiante
                </button>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#e9f2ff" }}>
                    <th style={thStyle}>DNI</th>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Apellidos</th>
                    <th style={thStyle}>Teléfono</th>
                    <th style={thStyle}>Grado</th>
                    <th style={thStyle}>Sección</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {estudiantesDeAsignatura.length > 0 ? (
                    estudiantesDeAsignatura.map((est) => (
                      <tr key={est.id}>
                        <td style={tdStyle}>{est.dni}</td>
                        <td style={tdStyle}>{est.nombres}</td>
                        <td style={tdStyle}>{est.apellidos}</td>
                        <td style={tdStyle}>{est.telefono}</td>
                        <td style={tdStyle}>{est.grado}</td>
                        <td style={tdStyle}>{est.seccion}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              backgroundColor:
                                est.estado === "Activo" ? "#28a745" : "#6c757d",
                              color: "white",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {est.estado}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => editarEstudiante(est)}
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
                              onClick={() => eliminarEstudiante(est.id)}
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
                      <td style={tdStyle} colSpan={8}>
                        No hay estudiantes registrados en esta asignatura
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })
      )}

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
              width: "850px",
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
                {modoEdicion ? "Editar Estudiante" : "Agregar Estudiante"}
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
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                }}
              >
                <div>
                  <label style={labelStyle}>DNI</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    style={inputStyle}
                    placeholder="Ingrese DNI"
                    maxLength={8}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={inputStyle}
                    placeholder="Ingrese teléfono"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    style={inputStyle}
                    placeholder="Ingrese nombre"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Apellidos</label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    style={inputStyle}
                    placeholder="Ingrese apellidos"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Grado</label>
                  <input
                    type="text"
                    value={grado}
                    readOnly
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f1f5f9",
                      color: "#111",
                      WebkitTextFillColor: "#111",
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Sección</label>
                  <input
                    type="text"
                    value={seccion}
                    readOnly
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f1f5f9",
                      color: "#111",
                      WebkitTextFillColor: "#111",
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Asignatura</label>
                  <input
                    type="text"
                    value={
                      asignaturaSeleccionada
                        ? obtenerNombreArea(asignaturaSeleccionada.area_id)
                        : ""
                    }
                    readOnly
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f1f5f9",
                      color: "#111",
                      WebkitTextFillColor: "#111",
                      cursor: "not-allowed",
                    }}
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
                  onClick={modoEdicion ? actualizarEstudiante : agregarEstudiante}
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
  color: "#111",
  backgroundColor: "#ffffff",
  opacity: 1, 
  WebkitTextFillColor: "#111",
  fontSize: "16px", 
};