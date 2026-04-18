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

type Competencia = {
  id: number;
  area_id: number;
  nombre: string;
  orden: number | null;
  estado: string;
};

type Capacidad = {
  id: number;
  competencia_id: number;
  nombre: string;
  orden: number | null;
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

type Asistencia = {
  id: number;
  estudiante_id: number;
  asignatura_id: number;
  fecha: string;
  estado: "A" | "T" | "F" | "J" | "I";
  created_at: string;
  updated_at: string;
};

type ReportColumn = {
  calificacionId: number;
  competencia: string;
  capacidad: string;
  asunto: string;
};

export default function ReportesPage() {
  const [vistaActiva, setVistaActiva] = useState<"notas" | "asistencia">("notas");

  const [areas, setAreas] = useState<Area[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [capacidades, setCapacidades] = useState<Capacidad[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [detalles, setDetalles] = useState<DetalleCalificacion[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);

  const [asignaturaNotasId, setAsignaturaNotasId] = useState("");
  const [unidadNotas, setUnidadNotas] = useState("");

  const [asignaturaAsistenciaId, setAsignaturaAsistenciaId] = useState("");
  const [mesAsistencia, setMesAsistencia] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [anioAsistencia, setAnioAsistencia] = useState(
    String(new Date().getFullYear())
  );

  useEffect(() => {
    cargarBase();
  }, []);

  useEffect(() => {
    if (!asignaturaNotasId) {
      setCalificaciones([]);
      setDetalles([]);
      return;
    }
    cargarReporteNotas(Number(asignaturaNotasId));
  }, [asignaturaNotasId]);

  useEffect(() => {
    if (!asignaturaAsistenciaId) {
      setAsistencias([]);
      return;
    }
    cargarReporteAsistencia(Number(asignaturaAsistenciaId));
  }, [asignaturaAsistenciaId, mesAsistencia, anioAsistencia]);

  const cargarBase = async () => {
    const [
      { data: areasData },
      { data: asignaturasData },
      { data: estudiantesData },
      { data: competenciasData },
      { data: capacidadesData },
    ] = await Promise.all([
      supabase.from("areas").select("*").order("nombre", { ascending: true }),
      supabase.from("asignaturas").select("*").order("id", { ascending: true }),
      supabase.from("estudiantes").select("*").order("apellidos", { ascending: true }),
      supabase.from("competencias").select("*").order("orden", { ascending: true }),
      supabase.from("capacidades").select("*").order("orden", { ascending: true }),
    ]);

    setAreas((areasData as Area[]) || []);
    setAsignaturas((asignaturasData as Asignatura[]) || []);
    setEstudiantes((estudiantesData as Estudiante[]) || []);
    setCompetencias((competenciasData as Competencia[]) || []);
    setCapacidades((capacidadesData as Capacidad[]) || []);
  };

  const cargarReporteNotas = async (asignaturaId: number) => {
    const { data: calificacionesData, error: errorCalificaciones } = await supabase
      .from("calificaciones")
      .select("*")
      .eq("asignatura_id", asignaturaId)
      .order("unidad", { ascending: true })
      .order("fecha_registro", { ascending: true });

    if (errorCalificaciones) {
      console.log("Error al obtener calificaciones:", errorCalificaciones);
      setCalificaciones([]);
      setDetalles([]);
      return;
    }

    const listaCalificaciones = (calificacionesData as Calificacion[]) || [];
    setCalificaciones(listaCalificaciones);

    if (listaCalificaciones.length === 0) {
      setDetalles([]);
      return;
    }

    const ids = listaCalificaciones.map((item) => item.id);

    const { data: detallesData, error: errorDetalles } = await supabase
      .from("detalle_calificaciones")
      .select("*")
      .in("calificacion_id", ids)
      .order("fecha_registro", { ascending: true });

    if (errorDetalles) {
      console.log("Error al obtener detalles:", errorDetalles);
      setDetalles([]);
      return;
    }

    setDetalles((detallesData as DetalleCalificacion[]) || []);
  };

  const cargarReporteAsistencia = async (asignaturaId: number) => {
    const inicioMes = `${anioAsistencia}-${mesAsistencia}-01`;
    const ultimoDia = new Date(
      Number(anioAsistencia),
      Number(mesAsistencia),
      0
    ).getDate();
    const finMes = `${anioAsistencia}-${mesAsistencia}-${String(ultimoDia).padStart(
      2,
      "0"
    )}`;

    const { data, error } = await supabase
      .from("asistencias")
      .select("*")
      .eq("asignatura_id", asignaturaId)
      .gte("fecha", inicioMes)
      .lte("fecha", finMes)
      .order("fecha", { ascending: true });

    if (error) {
      console.log("Error al obtener asistencias:", error);
      setAsistencias([]);
      return;
    }

    setAsistencias((data as Asistencia[]) || []);
  };

  const obtenerNombreArea = (areaId: number) => {
    const area = areas.find((item) => item.id === areaId);
    return area ? area.nombre : "Área no encontrada";
  };

  const obtenerNombreCompetencia = (id: number) => {
    const competencia = competencias.find((item) => item.id === id);
    return competencia ? competencia.nombre : "Competencia no encontrada";
  };

  const obtenerNombreCapacidad = (id: number) => {
    const capacidad = capacidades.find((item) => item.id === id);
    return capacidad ? capacidad.nombre : "Capacidad no encontrada";
  };

  const obtenerNombreEstudiante = (id: number) => {
    const estudiante = estudiantes.find((item) => item.id === id);
    return estudiante
      ? `${estudiante.apellidos}, ${estudiante.nombres}`
      : "Estudiante no encontrado";
  };

  const obtenerDniEstudiante = (id: number) => {
    const estudiante = estudiantes.find((item) => item.id === id);
    return estudiante ? estudiante.dni : "-";
  };

  const convertirNotaAValor = (nota: string) => {
    switch (nota) {
      case "AD":
        return 4;
      case "A":
        return 3;
      case "B":
        return 2;
      case "C":
        return 1;
      case "NR":
        return 1;
      default:
        return 0;
    }
  };

  const convertirValorALetra = (valor: number) => {
    if (valor >= 3.5) return "AD";
    if (valor >= 2.5) return "A";
    if (valor >= 1.5) return "B";
    return "C";
  };

  const asignaturaNotas = asignaturas.find(
    (item) => item.id === Number(asignaturaNotasId)
  );
  const asignaturaAsistencia = asignaturas.find(
    (item) => item.id === Number(asignaturaAsistenciaId)
  );

  const unidadesDisponiblesNotas = useMemo(() => {
    const fijas = ["Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4"];
    const desdeBd = [...new Set(calificaciones.map((item) => item.unidad))];
    return [...new Set([...fijas, ...desdeBd])];
  }, [calificaciones]);

  const calificacionesFiltradas = useMemo(() => {
    return unidadNotas
      ? calificaciones.filter((item) => item.unidad === unidadNotas)
      : calificaciones;
  }, [calificaciones, unidadNotas]);

  const columnasReporte: ReportColumn[] = useMemo(() => {
    return calificacionesFiltradas.map((cal) => ({
      calificacionId: cal.id,
      competencia: obtenerNombreCompetencia(cal.competencia_id),
      capacidad: obtenerNombreCapacidad(cal.capacidad_id),
      asunto: cal.asunto,
    }));
  }, [calificacionesFiltradas, competencias, capacidades]);

  const gruposCompetencia = useMemo(() => {
    const grupos: { nombre: string; cantidad: number }[] = [];

    columnasReporte.forEach((col) => {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.nombre === col.competencia) {
        ultimo.cantidad += 1;
      } else {
        grupos.push({ nombre: col.competencia, cantidad: 1 });
      }
    });

    return grupos;
  }, [columnasReporte]);

  const gruposCapacidad = useMemo(() => {
    const grupos: { nombre: string; cantidad: number }[] = [];

    columnasReporte.forEach((col) => {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.nombre === col.capacidad) {
        ultimo.cantidad += 1;
      } else {
        grupos.push({ nombre: col.capacidad, cantidad: 1 });
      }
    });

    return grupos;
  }, [columnasReporte]);

  const estudiantesDeAsignaturaNotas = useMemo(() => {
    if (!asignaturaNotasId) return [];
    return estudiantes.filter(
      (item) => item.asignatura_id === Number(asignaturaNotasId)
    );
  }, [estudiantes, asignaturaNotasId]);

  const detallePorCalificacionYEstudiante = useMemo(() => {
    const mapa: Record<string, DetalleCalificacion> = {};

    detalles.forEach((detalle) => {
      mapa[`${detalle.calificacion_id}-${detalle.estudiante_id}`] = detalle;
    });

    return mapa;
  }, [detalles]);

  const resumenUnidadPorEstudiante = useMemo(() => {
    const resultado: Record<
      string,
      { letra: string; valor: number | string }
    > = {};

    estudiantesDeAsignaturaNotas.forEach((estudiante) => {
      const notasUnidad = calificacionesFiltradas
        .map((cal) => detallePorCalificacionYEstudiante[`${cal.id}-${estudiante.id}`]?.nota || "")
        .filter((nota) => nota !== "");

      if (notasUnidad.length === 0) {
        resultado[estudiante.id] = { letra: "-", valor: "-" };
        return;
      }

      const suma = notasUnidad.reduce(
        (acc, nota) => acc + convertirNotaAValor(nota),
        0
      );
      const promedio = Number((suma / notasUnidad.length).toFixed(2));

      resultado[estudiante.id] = {
        letra: convertirValorALetra(promedio),
        valor: promedio,
      };
    });

    return resultado;
  }, [estudiantesDeAsignaturaNotas, calificacionesFiltradas, detallePorCalificacionYEstudiante]);

  const resumenAsistenciaPorEstudiante = useMemo(() => {
    if (!asignaturaAsistenciaId) return [];

    const estudiantesDeAsignatura = estudiantes.filter(
      (item) => item.asignatura_id === Number(asignaturaAsistenciaId)
    );

    return estudiantesDeAsignatura.map((estudiante) => {
      const registros = asistencias.filter((a) => a.estudiante_id === estudiante.id);

      const asistio = registros.filter((r) => r.estado === "A").length;
      const tardanza = registros.filter((r) => r.estado === "T").length;
      const justificado = registros.filter((r) => r.estado === "J").length;
      const falta = registros.filter((r) => r.estado === "F").length;
      const institucional = registros.filter((r) => r.estado === "I").length;

      const total = asistio + tardanza + justificado + falta + institucional;
      const computables = asistio + tardanza;
      const porcentaje =
        total > 0 ? Number(((computables / total) * 100).toFixed(0)) : 0;

      return {
        estudiante: `${estudiante.apellidos}, ${estudiante.nombres}`,
        dni: estudiante.dni,
        asistio,
        tardanza,
        justificado,
        falta,
        institucional,
        porcentaje,
      };
    });
  }, [asistencias, estudiantes, asignaturaAsistenciaId]);

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
        <h1 style={{ margin: 0, color: "#1e3c72" }}>Reportes</h1>
        <p style={{ marginTop: "8px", color: "#666" }}>
          Consulta el historial de notas y asistencia por asignatura.
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setVistaActiva("notas")}
            style={vistaActiva === "notas" ? btnPrimary : btnGray}
          >
            Reporte de Notas
          </button>

          <button
            onClick={() => setVistaActiva("asistencia")}
            style={vistaActiva === "asistencia" ? btnPrimary : btnGray}
          >
            Reporte de Asistencia
          </button>
        </div>
      </div>

      {vistaActiva === "notas" && (
        <>
          <div style={cardStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "18px",
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>Asignatura</label>
                <select
                  value={asignaturaNotasId}
                  onChange={(e) => {
                    setAsignaturaNotasId(e.target.value);
                    setUnidadNotas("");
                  }}
                  style={inputStyle}
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
                <label style={labelStyle}>Unidad</label>
                <select
                  value={unidadNotas}
                  onChange={(e) => setUnidadNotas(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Todas las unidades</option>
                  {unidadesDisponiblesNotas.map((unidad) => (
                    <option key={unidad} value={unidad}>
                      {unidad}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {asignaturaNotas && (
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, color: "#333" }}>
                Reporte histórico de notas
              </h2>
              <p style={{ color: "#666" }}>
                {obtenerNombreArea(asignaturaNotas.area_id)} - {asignaturaNotas.grado}{" "}
                {asignaturaNotas.seccion}
                {unidadNotas ? ` | ${unidadNotas}` : ""}
              </p>

              <div style={{ overflowX: "auto", marginTop: "15px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: `${500 + columnasReporte.length * 140}px`,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={thSticky} rowSpan={3}>
                        DNI
                      </th>
                      <th style={thSticky2} rowSpan={3}>
                        Estudiante
                      </th>

                      {gruposCompetencia.length > 0 ? (
                        gruposCompetencia.map((grupo, index) => (
                          <th
                            key={`comp-${index}`}
                            colSpan={grupo.cantidad}
                            style={thCompetencia}
                          >
                            {grupo.nombre}
                          </th>
                        ))
                      ) : (
                        <th style={thStyle}>Sin datos</th>
                      )}

                      <th style={thPromedio} rowSpan={3}>
                        Promedio Unidad Letra
                      </th>
                      <th style={thPromedio} rowSpan={3}>
                        Promedio Unidad Valor
                      </th>
                    </tr>

                    <tr>
                      {gruposCapacidad.length > 0 ? (
                        gruposCapacidad.map((grupo, index) => (
                          <th
                            key={`cap-${index}`}
                            colSpan={grupo.cantidad}
                            style={thCapacidad}
                          >
                            {grupo.nombre}
                          </th>
                        ))
                      ) : (
                        <th style={thStyle}>-</th>
                      )}
                    </tr>

                    <tr>
                      {columnasReporte.length > 0 ? (
                        columnasReporte.map((col) => (
                          <th key={col.calificacionId} style={thAsunto}>
                            {col.asunto}
                          </th>
                        ))
                      ) : (
                        <th style={thStyle}>-</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {estudiantesDeAsignaturaNotas.length > 0 ? (
                      estudiantesDeAsignaturaNotas.map((estudiante) => {
                        const resumen = resumenUnidadPorEstudiante[estudiante.id] || {
                          letra: "-",
                          valor: "-",
                        };

                        return (
                          <tr key={estudiante.id}>
                            <td style={tdSticky}>{estudiante.dni}</td>
                            <td style={tdSticky2}>
                              {estudiante.apellidos}, {estudiante.nombres}
                            </td>

                            {columnasReporte.length > 0 ? (
                              columnasReporte.map((col) => {
                                const detalle =
                                  detallePorCalificacionYEstudiante[
                                    `${col.calificacionId}-${estudiante.id}`
                                  ];

                                return (
                                  <td key={col.calificacionId} style={tdStyle}>
                                    {detalle?.nota || "-"}
                                  </td>
                                );
                              })
                            ) : (
                              <td style={tdStyle}>-</td>
                            )}

                            <td style={tdPromedio}>{resumen.letra}</td>
                            <td style={tdPromedio}>{resumen.valor}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          style={tdStyle}
                          colSpan={2 + Math.max(columnasReporte.length, 1) + 2}
                        >
                          No hay registros de notas para este filtro
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {vistaActiva === "asistencia" && (
        <>
          <div style={cardStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                gap: "18px",
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>Asignatura</label>
                <select
                  value={asignaturaAsistenciaId}
                  onChange={(e) => setAsignaturaAsistenciaId(e.target.value)}
                  style={inputStyle}
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
                <label style={labelStyle}>Mes</label>
                <select
                  value={mesAsistencia}
                  onChange={(e) => setMesAsistencia(e.target.value)}
                  style={inputStyle}
                >
                  <option value="01">Enero</option>
                  <option value="02">Febrero</option>
                  <option value="03">Marzo</option>
                  <option value="04">Abril</option>
                  <option value="05">Mayo</option>
                  <option value="06">Junio</option>
                  <option value="07">Julio</option>
                  <option value="08">Agosto</option>
                  <option value="09">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Año</label>
                <input
                  type="text"
                  value={anioAsistencia}
                  onChange={(e) => setAnioAsistencia(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {asignaturaAsistencia && (
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, color: "#333" }}>
                Reporte histórico de asistencia
              </h2>
              <p style={{ color: "#666" }}>
                {obtenerNombreArea(asignaturaAsistencia.area_id)} -{" "}
                {asignaturaAsistencia.grado} {asignaturaAsistencia.seccion} |{" "}
                {mesNombre(mesAsistencia)} {anioAsistencia}
              </p>

              <div style={{ overflowX: "auto", marginTop: "15px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "1000px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#eef4ff" }}>
                      <th style={thStyle}>DNI</th>
                      <th style={thStyle}>Estudiante</th>
                      <th style={thStyle}>A</th>
                      <th style={thStyle}>T</th>
                      <th style={thStyle}>J</th>
                      <th style={thStyle}>F</th>
                      <th style={thStyle}>I</th>
                      <th style={thStyle}>Asistencia %</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resumenAsistenciaPorEstudiante.length > 0 ? (
                      resumenAsistenciaPorEstudiante.map((fila) => (
                        <tr key={fila.dni}>
                          <td style={tdStyle}>{fila.dni}</td>
                          <td style={tdStyle}>{fila.estudiante}</td>
                          <td style={tdStyle}>{fila.asistio}</td>
                          <td style={tdStyle}>{fila.tardanza}</td>
                          <td style={tdStyle}>{fila.justificado}</td>
                          <td style={tdStyle}>{fila.falta}</td>
                          <td style={tdStyle}>{fila.institucional}</td>
                          <td style={tdStyle}>{fila.porcentaje}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={tdStyle} colSpan={8}>
                          No hay registros de asistencia para este filtro
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function mesNombre(mes: string) {
  const meses: Record<string, string> = {
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre",
  };
  return meses[mes] || mes;
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
};

const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#333",
  backgroundColor: "#ffffff",
  minWidth: "100px",
};

const thCompetencia = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#000",
  backgroundColor: "#facc15",
  minWidth: "140px",
  fontWeight: "bold",
};

const thCapacidad = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#000",
  backgroundColor: "#d9f99d",
  minWidth: "140px",
  fontWeight: "bold",
};

const thAsunto = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#000",
  backgroundColor: "#f8fafc",
  minWidth: "90px",
  fontWeight: "bold",
};

const thPromedio = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#000",
  backgroundColor: "#dcfce7",
  minWidth: "130px",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  color: "#333",
  textAlign: "center" as const,
  backgroundColor: "#fff",
};

const tdPromedio = {
  padding: "12px",
  border: "1px solid #ddd",
  color: "#111",
  textAlign: "center" as const,
  backgroundColor: "#f0fdf4",
  fontWeight: "bold",
};

const thSticky = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#333",
  backgroundColor: "#ffffff",
  minWidth: "100px",
  position: "sticky" as const,
  left: 0,
  zIndex: 3,
};

const thSticky2 = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center" as const,
  color: "#333",
  backgroundColor: "#ffffff",
  minWidth: "280px",
  position: "sticky" as const,
  left: 100,
  zIndex: 3,
};

const tdSticky = {
  padding: "12px",
  border: "1px solid #ddd",
  color: "#333",
  textAlign: "center" as const,
  backgroundColor: "#ffffff",
  position: "sticky" as const,
  left: 0,
  zIndex: 1,
};

const tdSticky2 = {
  padding: "12px",
  border: "1px solid #ddd",
  color: "#333",
  backgroundColor: "#ffffff",
  position: "sticky" as const,
  left: 100,
  zIndex: 1,
  minWidth: "280px",
};

const btnPrimary = {
  backgroundColor: "#17a2b8",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const btnGray = {
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};