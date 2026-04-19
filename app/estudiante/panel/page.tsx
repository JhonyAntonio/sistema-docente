"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Estudiante = {
  id: number;
  dni: string;
  nombres?: string;
  apellidos?: string;
  grado?: string;
  seccion?: string;
};

type Asistencia = {
  id: number;
  estudiante_id: number;
  fecha: string;
  estado: string;
};

type Asignatura = {
  id: number;
  area_id: number;
  grado: string;
  seccion: string;
  estado: string;
};

type Area = {
  id: number;
  nombre: string;
  estado: string;
};

type Calificacion = {
  id: number;
  asignatura_id: number;
  unidad: string;
  competencia_id: number;
  capacidad_id: number;
  asunto: string;
  estado: string;
  fecha_registro: string;
};

type DetalleCalificacion = {
  id: number;
  calificacion_id: number;
  estudiante_id: number;
  nota: string;
  promedio_letra: string | null;
  promedio_valor: number | null;
  publicado: boolean;
  fecha_registro: string;
  fecha_actualizacion: string;
};

type NotaMostrada = {
  id: number;
  curso: string;
  unidad: string;
  asunto: string;
  nota: string;
  promedioLetra: string | null;
  promedioValor: number | null;
  fecha: string;
};

export default function PanelEstudiante() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [notas, setNotas] = useState<NotaMostrada[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("Unidad 1");

  const [claveActual, setClaveActual] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [mensajeClave, setMensajeClave] = useState("");
  const [guardandoClave, setGuardandoClave] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      const usuarioId = localStorage.getItem("usuario_id");
      const usuarioRol = localStorage.getItem("usuario_rol");
      const estudianteIdGuardado = localStorage.getItem("usuario_estudiante_id");

      if (!usuarioId || !usuarioRol) {
        router.push("/");
        return;
      }

      if (usuarioRol !== "estudiante") {
        router.push("/");
        return;
      }

      if (!estudianteIdGuardado) {
        setMensaje("No se encontró el estudiante asociado.");
        setCargando(false);
        return;
      }

      const estudianteId = Number(estudianteIdGuardado);

      try {
        const { data: dataEstudiante, error: errorEstudiante } = await supabase
          .from("estudiantes")
          .select("*")
          .eq("id", estudianteId)
          .single();

        if (errorEstudiante || !dataEstudiante) {
          setMensaje("No se pudo cargar la información del estudiante.");
          setCargando(false);
          return;
        }

        setEstudiante(dataEstudiante as Estudiante);

        const { data: dataAsistencias, error: errorAsistencias } = await supabase
          .from("asistencias")
          .select("*")
          .eq("estudiante_id", estudianteId)
          .order("fecha", { ascending: false });

        if (errorAsistencias) {
          console.log("Error al cargar asistencias:", errorAsistencias);
        } else {
          setAsistencias((dataAsistencias as Asistencia[]) || []);
        }

        const { data: dataDetalles, error: errorDetalles } = await supabase
          .from("detalle_calificaciones")
          .select("*")
          .eq("estudiante_id", estudianteId)
          .eq("publicado", true)
          .order("id", { ascending: false });

        if (errorDetalles) {
          console.log("Error al cargar detalles de calificación:", errorDetalles);
          setNotas([]);
          setCargando(false);
          return;
        }

        const detalles = (dataDetalles as DetalleCalificacion[]) || [];

        if (detalles.length === 0) {
          setNotas([]);
          setCargando(false);
          return;
        }

        const calificacionIds = [...new Set(detalles.map((d) => d.calificacion_id))];

        const { data: dataCalificaciones, error: errorCalificaciones } =
          await supabase
            .from("calificaciones")
            .select("*")
            .in("id", calificacionIds);

        if (errorCalificaciones) {
          console.log("Error al cargar calificaciones:", errorCalificaciones);
          setNotas([]);
          setCargando(false);
          return;
        }

        const calificaciones = (dataCalificaciones as Calificacion[]) || [];

        const asignaturaIds = [...new Set(calificaciones.map((c) => c.asignatura_id))];

        const { data: dataAsignaturas, error: errorAsignaturas } = await supabase
          .from("asignaturas")
          .select("*")
          .in("id", asignaturaIds);

        if (errorAsignaturas) {
          console.log("Error al cargar asignaturas:", errorAsignaturas);
          setNotas([]);
          setCargando(false);
          return;
        }

        const asignaturas = (dataAsignaturas as Asignatura[]) || [];

        const areaIds = [...new Set(asignaturas.map((a) => a.area_id))];

        const { data: dataAreas, error: errorAreas } = await supabase
          .from("areas")
          .select("*")
          .in("id", areaIds);

        if (errorAreas) {
          console.log("Error al cargar áreas:", errorAreas);
          setNotas([]);
          setCargando(false);
          return;
        }

        const areas = (dataAreas as Area[]) || [];

        const notasTransformadas: NotaMostrada[] = detalles.map((detalle) => {
          const calificacion = calificaciones.find(
            (c) => c.id === detalle.calificacion_id
          );

          const asignatura = asignaturas.find(
            (a) => a.id === calificacion?.asignatura_id
          );

          const area = areas.find((ar) => ar.id === asignatura?.area_id);

          return {
            id: detalle.id,
            curso: area?.nombre ?? "Curso no encontrado",
            unidad: calificacion?.unidad ?? "-",
            asunto: calificacion?.asunto ?? "-",
            nota: detalle.nota ?? "-",
            promedioLetra: detalle.promedio_letra,
            promedioValor: detalle.promedio_valor,
            fecha: detalle.fecha_registro ?? detalle.fecha_actualizacion ?? "-",
          };
        });

        setNotas(notasTransformadas);
      } catch (error) {
        console.log("Error general al cargar panel del estudiante:", error);
        setMensaje("Ocurrió un error al cargar los datos.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [router]);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("usuario_dni");
    localStorage.removeItem("usuario_correo");
    localStorage.removeItem("usuario_rol");
    localStorage.removeItem("usuario_estudiante_id");
    router.push("/");
  };

  const cambiarClave = async () => {
    setMensajeClave("");

    const usuarioId = localStorage.getItem("usuario_id");

    if (!usuarioId) {
      setMensajeClave("No se encontró la sesión del usuario.");
      return;
    }

    if (!claveActual || !nuevaClave || !confirmarClave) {
      setMensajeClave("Completa todos los campos.");
      return;
    }

    if (nuevaClave.length < 4) {
      setMensajeClave("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (nuevaClave !== confirmarClave) {
      setMensajeClave("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setGuardandoClave(true);

    try {
      const { data: usuario, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("id, password")
        .eq("id", usuarioId)
        .single();

      if (errorUsuario || !usuario) {
        setMensajeClave("No se pudo validar el usuario.");
        setGuardandoClave(false);
        return;
      }

      if (usuario.password !== claveActual) {
        setMensajeClave("La contraseña actual es incorrecta.");
        setGuardandoClave(false);
        return;
      }

      const { error: errorUpdate } = await supabase
        .from("usuarios")
        .update({
          password: nuevaClave,
          debe_cambiar_clave: false,
        })
        .eq("id", usuarioId);

      if (errorUpdate) {
        setMensajeClave("No se pudo actualizar la contraseña.");
        setGuardandoClave(false);
        return;
      }

      setMensajeClave("Contraseña actualizada correctamente.");
      setClaveActual("");
      setNuevaClave("");
      setConfirmarClave("");
    } catch (error) {
      setMensajeClave("Ocurrió un error al cambiar la contraseña.");
    } finally {
      setGuardandoClave(false);
    }
  };

  const totalRegistros = asistencias.length;

const totalAsistio = asistencias.filter((item) => {
  const estado = item.estado?.toUpperCase().trim();
  return estado === "A";
}).length;

const totalTardanzas = asistencias.filter((item) => {
  const estado = item.estado?.toUpperCase().trim();
  return estado === "T";
}).length;

const totalJustificados = asistencias.filter((item) => {
  const estado = item.estado?.toUpperCase().trim();
  return estado === "J";
}).length;

const totalFaltas = asistencias.filter((item) => {
  const estado = item.estado?.toUpperCase().trim();
  return estado === "F";
}).length;

const totalInstitucionales = asistencias.filter((item) => {
  const estado = item.estado?.toUpperCase().trim();
  return estado === "I";
}).length;

const porcentajeAsistencia =
  totalRegistros > 0
    ? (((totalAsistio + totalTardanzas) / totalRegistros) * 100).toFixed(1)
    : "0.0";

  const notasUnidadSeleccionada = useMemo(() => {
    return notas.filter((nota) => nota.unidad === unidadSeleccionada);
  }, [notas, unidadSeleccionada]);

  const promedioUnidadSeleccionada = useMemo(() => {
    if (notasUnidadSeleccionada.length === 0) {
      return { letra: "-", valor: "-" };
    }

    const registroConPromedio = notasUnidadSeleccionada.find(
      (item) =>
        item.promedioLetra !== null &&
        item.promedioLetra !== undefined &&
        item.promedioValor !== null &&
        item.promedioValor !== undefined
    );

    return {
      letra: registroConPromedio?.promedioLetra ?? "-",
      valor:
        registroConPromedio?.promedioValor !== null &&
        registroConPromedio?.promedioValor !== undefined
          ? registroConPromedio.promedioValor
          : "-",
    };
  }, [notasUnidadSeleccionada]);

  if (cargando) {
    return (
      <div style={loadingContainer}>
        Cargando datos del estudiante...
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Panel del Estudiante</h1>
            <p style={subtitleStyle}>Bienvenido al sistema.</p>
          </div>

          <button onClick={cerrarSesion} style={logoutButton}>
            Cerrar sesión
          </button>
        </div>

        {mensaje && <div style={alertStyle}>{mensaje}</div>}

        <div style={summaryGrid}>
          <div style={panelCard}>
            <h2 style={sectionTitle}>Mis datos</h2>

            <p style={textRow}><strong>Nombres:</strong> {estudiante?.nombres ?? "-"}</p>
            <p style={textRow}><strong>Apellidos:</strong> {estudiante?.apellidos ?? "-"}</p>
            <p style={textRow}><strong>DNI:</strong> {estudiante?.dni ?? "-"}</p>
            <p style={textRow}><strong>Grado:</strong> {estudiante?.grado ?? "-"}</p>
            <p style={textRow}><strong>Sección:</strong> {estudiante?.seccion ?? "-"}</p>
          </div>

          <div style={panelCard}>
            <h2 style={sectionTitle}>Resumen de asistencia</h2>

            <p style={textRow}><strong>Total de registros:</strong> {totalRegistros}</p>
            <p style={textRow}><strong>Asistencias:</strong> {totalAsistio}</p>
            <p style={textRow}><strong>Tardanzas:</strong> {totalTardanzas}</p>
            <p style={textRow}><strong>Justificados:</strong> {totalJustificados}</p>
            <p style={textRow}><strong>Faltas:</strong> {totalFaltas}</p>
            <p style={textRow}><strong>Actividades institucionales:</strong> {totalInstitucionales}</p>
            <p style={textRow}><strong>Porcentaje:</strong> {porcentajeAsistencia}%</p>
          </div>
        </div>

        <div style={panelCard}>
          <h2 style={sectionTitle}>Mis notas por unidad</h2>

          <div style={{ marginBottom: "20px", maxWidth: "260px" }}>
            <label style={selectLabel}>Selecciona una unidad</label>

            <select
              value={unidadSeleccionada}
              onChange={(e) => setUnidadSeleccionada(e.target.value)}
              style={selectStyle}
            >
              <option value="Unidad 1">Unidad 1</option>
              <option value="Unidad 2">Unidad 2</option>
              <option value="Unidad 3">Unidad 3</option>
              <option value="Unidad 4">Unidad 4</option>
            </select>
          </div>

          {notasUnidadSeleccionada.length === 0 ? (
            <div style={emptyBox}>
              Aún no hay registros en {unidadSeleccionada}.
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto", marginBottom: "16px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "650px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#1b2a41" }}>
                      <th style={thStyle}>Curso</th>
                      <th style={thStyle}>Actividad</th>
                      <th style={thStyle}>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasUnidadSeleccionada.map((item) => (
                      <tr key={item.id}>
                        <td style={tdStyle}>{item.curso}</td>
                        <td style={tdStyle}>{item.asunto}</td>
                        <td style={tdStyle}>{item.nota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={averageGrid}>
                <div style={averageCard}>
                  <p style={averageLabel}>
                    Promedio de {unidadSeleccionada} (Letra)
                  </p>
                  <p style={averageValue}>{promedioUnidadSeleccionada.letra}</p>
                </div>

                <div style={averageCard}>
                  <p style={averageLabel}>
                    Promedio de {unidadSeleccionada} (Valor)
                  </p>
                  <p style={averageValue}>{promedioUnidadSeleccionada.valor}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={panelCard}>
          <h2 style={sectionTitle}>Mi registro de asistencia</h2>

          {asistencias.length === 0 ? (
            <p style={textRow}>No hay asistencias registradas todavía.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "500px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#1b2a41" }}>
                    <th style={thStyle}>Fecha</th>
                    <th style={thStyle}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.map((item) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>{item.fecha}</td>
                      <td style={tdStyle}>{item.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={panelCard}>
          <h2 style={sectionTitle}>Cambiar contraseña</h2>

          <input
            type="password"
            placeholder="Contraseña actual"
            value={claveActual}
            onChange={(e) => setClaveActual(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nuevaClave}
            onChange={(e) => setNuevaClave(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmarClave}
            onChange={(e) => setConfirmarClave(e.target.value)}
            style={inputStyle}
          />

          {mensajeClave && (
            <p
              style={{
                color: mensajeClave.includes("correctamente")
                  ? "#7CFC98"
                  : "#ff7b7b",
                marginBottom: "12px",
                fontSize: "14px",
                opacity: 1,
              }}
            >
              {mensajeClave}
            </p>
          )}

          <button
            onClick={cambiarClave}
            disabled={guardandoClave}
            style={{
              ...updateButton,
              opacity: guardandoClave ? 0.7 : 1,
            }}
          >
            {guardandoClave ? "Guardando..." : "Actualizar contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #000000, #001f3f, #000000)",
  color: "#fff",
  padding: "30px 20px",
};

const containerStyle = {
  maxWidth: "1150px",
  margin: "0 auto",
};

const loadingContainer = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #000000, #001f3f, #000000)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  fontSize: "18px",
};

const headerStyle = {
  backgroundColor: "#111",
  borderRadius: "14px",
  padding: "25px",
  marginBottom: "20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap" as const,
};

const titleStyle = {
  color: "#FFC300",
  marginBottom: "8px",
  marginTop: 0,
  WebkitTextFillColor: "#FFC300",
};

const subtitleStyle = {
  margin: 0,
  color: "#ffffff",
  opacity: 1,
  WebkitTextFillColor: "#ffffff",
};

const logoutButton = {
  padding: "12px 18px",
  backgroundColor: "#FFC300",
  color: "#000",
  fontWeight: "bold",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const alertStyle = {
  backgroundColor: "#2a1215",
  color: "#ffb3b3",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px",
  opacity: 1,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
  marginBottom: "20px",
};

const panelCard = {
  backgroundColor: "#111",
  borderRadius: "14px",
  padding: "25px",
  marginBottom: "20px",
  color: "#fff",
};

const sectionTitle = {
  color: "#FFC300",
  marginBottom: "18px",
  marginTop: 0,
  WebkitTextFillColor: "#FFC300",
};

const textRow = {
  color: "#ffffff",
  opacity: 1,
  WebkitTextFillColor: "#ffffff",
};

const selectLabel = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "bold",
  color: "#fff",
  WebkitTextFillColor: "#fff",
  opacity: 1,
};

const selectStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #444",
  backgroundColor: "#000",
  color: "#fff",
  outline: "none",
  opacity: 1,
  WebkitTextFillColor: "#fff",
  fontSize: "16px",
};

const emptyBox = {
  backgroundColor: "#0d1b2a",
  border: "1px solid #2f3e56",
  borderRadius: "10px",
  padding: "18px",
  color: "#ffffff",
  opacity: 1,
};

const averageGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "15px",
};

const averageCard = {
  backgroundColor: "#0d1b2a",
  border: "1px solid #2f3e56",
  borderRadius: "10px",
  padding: "18px",
};

const averageLabel = {
  margin: 0,
  color: "#FFC300",
  fontWeight: "bold",
  WebkitTextFillColor: "#FFC300",
};

const averageValue = {
  margin: "10px 0 0 0",
  fontSize: "24px",
  color: "#ffffff",
  WebkitTextFillColor: "#ffffff",
  opacity: 1,
};

const thStyle = {
  border: "1px solid #2f3e56",
  padding: "12px",
  textAlign: "left" as const,
  color: "#fff",
  opacity: 1,
  WebkitTextFillColor: "#fff",
};

const tdStyle = {
  border: "1px solid #2f3e56",
  padding: "12px",
  color: "#fff",
  opacity: 1,
  WebkitTextFillColor: "#fff",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #444",
  backgroundColor: "#000",
  color: "#fff",
  outline: "none",
  boxSizing: "border-box" as const,
  opacity: 1,
  WebkitTextFillColor: "#fff",
  fontSize: "16px",
};

const updateButton = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#FFC300",
  color: "#000",
  fontWeight: "bold",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};