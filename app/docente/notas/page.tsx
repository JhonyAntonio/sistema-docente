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

export default function RegistroNotasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [capacidades, setCapacidades] = useState<Capacidad[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [detalles, setDetalles] = useState<DetalleCalificacion[]>([]);

  const [asignaturaSeleccionadaId, setAsignaturaSeleccionadaId] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  const [calificacionSeleccionadaId, setCalificacionSeleccionadaId] =
    useState("");

  const [mostrarFormularioCalificacion, setMostrarFormularioCalificacion] =
    useState(false);

  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);
  const [asuntoEditado, setAsuntoEditado] = useState("");

  const [unidadFormulario, setUnidadFormulario] = useState("");
  const [competenciaId, setCompetenciaId] = useState("");
  const [capacidadId, setCapacidadId] = useState("");
  const [asunto, setAsunto] = useState("");

  const [notasSeleccionadas, setNotasSeleccionadas] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    obtenerAreas();
    obtenerAsignaturas();
    obtenerCompetencias();
    obtenerCapacidades();
  }, []);

  useEffect(() => {
    if (!asignaturaSeleccionadaId) {
      setCalificaciones([]);
      setEstudiantes([]);
      setDetalles([]);
      setCalificacionSeleccionadaId("");
      setNotasSeleccionadas({});
      return;
    }

    cargarTodoDeAsignatura(Number(asignaturaSeleccionadaId));
  }, [asignaturaSeleccionadaId]);

  useEffect(() => {
    if (!calificacionSeleccionadaId) {
      setNotasSeleccionadas({});
      return;
    }

    const mapa: Record<number, string> = {};
    detalles
      .filter((item) => item.calificacion_id === Number(calificacionSeleccionadaId))
      .forEach((item) => {
        mapa[item.estudiante_id] = item.nota;
      });

    setNotasSeleccionadas(mapa);
  }, [calificacionSeleccionadaId, detalles]);

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

  const obtenerCompetencias = async () => {
    const { data, error } = await supabase
      .from("competencias")
      .select("*")
      .order("orden", { ascending: true });

    if (error) {
      console.log("Error al obtener competencias:", error);
    } else {
      setCompetencias((data as Competencia[]) || []);
    }
  };

  const obtenerCapacidades = async () => {
    const { data, error } = await supabase
      .from("capacidades")
      .select("*")
      .order("orden", { ascending: true });

    if (error) {
      console.log("Error al obtener capacidades:", error);
    } else {
      setCapacidades((data as Capacidad[]) || []);
    }
  };

  const cargarTodoDeAsignatura = async (asignaturaId: number) => {
    const { data: dataCalificaciones, error: errorCalificaciones } =
      await supabase
        .from("calificaciones")
        .select("*")
        .eq("asignatura_id", asignaturaId)
        .order("fecha_registro", { ascending: false });

    if (errorCalificaciones) {
      console.log("Error al obtener calificaciones:", errorCalificaciones);
      setCalificaciones([]);
      return;
    }

    const listaCalificaciones = (dataCalificaciones as Calificacion[]) || [];
    setCalificaciones(listaCalificaciones);

    const { data: dataEstudiantes, error: errorEstudiantes } = await supabase
      .from("estudiantes")
      .select("*")
      .eq("asignatura_id", asignaturaId)
      .order("apellidos", { ascending: true });

    if (errorEstudiantes) {
      console.log("Error al obtener estudiantes:", errorEstudiantes);
      setEstudiantes([]);
    } else {
      setEstudiantes((dataEstudiantes as Estudiante[]) || []);
    }

    if (listaCalificaciones.length > 0) {
      const ids = listaCalificaciones.map((item) => item.id);

      const { data: dataDetalles, error: errorDetalles } = await supabase
        .from("detalle_calificaciones")
        .select("*")
        .in("calificacion_id", ids)
        .order("id", { ascending: true });

      if (errorDetalles) {
        console.log("Error al obtener detalles:", errorDetalles);
        setDetalles([]);
      } else {
        setDetalles((dataDetalles as DetalleCalificacion[]) || []);
      }
    } else {
      setDetalles([]);
    }
  };

  const obtenerNombreArea = (area_id: number) => {
    const area = areas.find((item) => item.id === area_id);
    return area ? area.nombre : "Área no encontrada";
  };

  const obtenerNombreCompetencia = (competencia_id: number) => {
    const competencia = competencias.find((item) => item.id === competencia_id);
    return competencia ? competencia.nombre : "Competencia no encontrada";
  };

  const obtenerNombreCapacidad = (capacidad_id: number) => {
    const capacidad = capacidades.find((item) => item.id === capacidad_id);
    return capacidad ? capacidad.nombre : "Capacidad no encontrada";
  };

  const asignaturaSeleccionada = asignaturas.find(
    (item) => item.id === Number(asignaturaSeleccionadaId)
  );

  const competenciasDeArea = useMemo(() => {
    if (!asignaturaSeleccionada) return [];
    return competencias.filter(
      (item) => item.area_id === asignaturaSeleccionada.area_id
    );
  }, [asignaturaSeleccionada, competencias]);

  const capacidadesDeCompetencia = useMemo(() => {
    if (!competenciaId) return [];
    return capacidades.filter(
      (item) => item.competencia_id === Number(competenciaId)
    );
  }, [competenciaId, capacidades]);

  const calificacionesDeUnidad = useMemo(() => {
    return calificaciones.filter((item) => item.unidad === unidadSeleccionada);
  }, [calificaciones, unidadSeleccionada]);

  const calificacionSeleccionada = calificaciones.find(
    (item) => item.id === Number(calificacionSeleccionadaId)
  );

  const abrirFormularioCalificacion = () => {
    if (!asignaturaSeleccionadaId) {
      alert("Primero selecciona una asignatura");
      return;
    }

    setUnidadFormulario(unidadSeleccionada || "");
    setCompetenciaId("");
    setCapacidadId("");
    setAsunto("");
    setMostrarFormularioCalificacion(true);
  };

  const cerrarFormularioCalificacion = () => {
    setMostrarFormularioCalificacion(false);
    setUnidadFormulario("");
    setCompetenciaId("");
    setCapacidadId("");
    setAsunto("");
  };

  const abrirFormularioEditar = () => {
    if (!calificacionSeleccionada) {
      alert("Primero selecciona una calificación");
      return;
    }

    setAsuntoEditado(calificacionSeleccionada.asunto || "");
    setMostrarFormularioEditar(true);
  };

  const cerrarFormularioEditar = () => {
    setMostrarFormularioEditar(false);
    setAsuntoEditado("");
  };

  const actualizarAsunto = async () => {
    if (!calificacionSeleccionada) {
      alert("No hay una calificación seleccionada");
      return;
    }

    if (!asuntoEditado.trim()) {
      alert("Ingresa el nuevo asunto");
      return;
    }

    const { error } = await supabase
      .from("calificaciones")
      .update({
        asunto: asuntoEditado.trim(),
      })
      .eq("id", calificacionSeleccionada.id);

    if (error) {
      console.log("Error al actualizar asunto:", error);
      alert("No se pudo actualizar el asunto");
      return;
    }

    await cargarTodoDeAsignatura(Number(asignaturaSeleccionadaId));
    setCalificacionSeleccionadaId(String(calificacionSeleccionada.id));
    cerrarFormularioEditar();
    alert("Asunto actualizado correctamente");
  };

  const eliminarCalificacion = async () => {
    if (!calificacionSeleccionada) {
      alert("Primero selecciona una calificación");
      return;
    }

    const confirmar = confirm(
      `¿Seguro que deseas eliminar la calificación "${calificacionSeleccionada.asunto}"? Esta acción borrará también las notas registradas.`
    );

    if (!confirmar) return;

    const { error: errorDetalles } = await supabase
      .from("detalle_calificaciones")
      .delete()
      .eq("calificacion_id", calificacionSeleccionada.id);

    if (errorDetalles) {
      console.log("Error al eliminar detalles:", errorDetalles);
      alert("No se pudieron eliminar los detalles de la calificación");
      return;
    }

    const { error: errorCalificacion } = await supabase
      .from("calificaciones")
      .delete()
      .eq("id", calificacionSeleccionada.id);

    if (errorCalificacion) {
      console.log("Error al eliminar calificación:", errorCalificacion);
      alert("No se pudo eliminar la calificación");
      return;
    }

    await cargarTodoDeAsignatura(Number(asignaturaSeleccionadaId));
    setCalificacionSeleccionadaId("");
    setNotasSeleccionadas({});
    alert("Calificación eliminada correctamente");
  };

  const guardarCalificacion = async () => {
    if (
      !asignaturaSeleccionadaId ||
      !unidadFormulario ||
      !competenciaId ||
      !capacidadId ||
      !asunto
    ) {
      alert("Completa todos los campos");
      return;
    }

    const { error } = await supabase.from("calificaciones").insert([
      {
        asignatura_id: Number(asignaturaSeleccionadaId),
        unidad: unidadFormulario,
        competencia_id: Number(competenciaId),
        capacidad_id: Number(capacidadId),
        asunto,
        estado: "Borrador",
      },
    ]);

    if (error) {
      console.log("Error al guardar calificación:", error);
      alert("No se pudo guardar la calificación: " + error.message);
    } else {
      alert("Calificación creada correctamente");
      cerrarFormularioCalificacion();
      setUnidadSeleccionada(unidadFormulario);
      await cargarTodoDeAsignatura(Number(asignaturaSeleccionadaId));
    }
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

  const cambiarNota = (estudianteId: number, nota: string) => {
    setNotasSeleccionadas((prev) => ({
      ...prev,
      [estudianteId]: nota,
    }));
  };

  const obtenerPromedioUnidad = (estudianteId: number) => {
    const detallesDeUnidad = detalles.filter((detalle) => {
      const cal = calificaciones.find((c) => c.id === detalle.calificacion_id);
      return cal?.unidad === unidadSeleccionada && detalle.estudiante_id === estudianteId;
    });

    const otrasNotas = detallesDeUnidad
      .filter((detalle) => detalle.calificacion_id !== Number(calificacionSeleccionadaId))
      .map((detalle) => detalle.nota);

    const notaActual = notasSeleccionadas[estudianteId];
    const notasFinales = [...otrasNotas, ...(notaActual ? [notaActual] : [])];

    if (notasFinales.length === 0) {
      return { letra: "-", valor: 0 };
    }

    const suma = notasFinales.reduce(
      (acc, nota) => acc + convertirNotaAValor(nota),
      0
    );

    const promedio = suma / notasFinales.length;

    return {
      letra: convertirValorALetra(promedio),
      valor: Number(promedio.toFixed(2)),
    };
  };

  const guardarNotas = async (mostrarMensaje = true) => {
    if (!calificacionSeleccionada) {
      alert("Selecciona una calificación");
      return false;
    }

    for (const estudiante of estudiantes) {
      const nota = notasSeleccionadas[estudiante.id];
      if (!nota) continue;

      const promedio = obtenerPromedioUnidad(estudiante.id);

      const detalleExistente = detalles.find(
        (item) =>
          item.calificacion_id === calificacionSeleccionada.id &&
          item.estudiante_id === estudiante.id
      );

      if (detalleExistente) {
        const { error } = await supabase
          .from("detalle_calificaciones")
          .update({
            nota,
            promedio_letra: promedio.letra,
            promedio_valor: promedio.valor,
            fecha_actualizacion: new Date().toISOString(),
          })
          .eq("id", detalleExistente.id);

        if (error) {
          console.log("Error al actualizar detalle:", error);
          alert("No se pudo actualizar una de las notas");
          return false;
        }
      } else {
        const { error } = await supabase.from("detalle_calificaciones").insert([
          {
            calificacion_id: calificacionSeleccionada.id,
            estudiante_id: estudiante.id,
            nota,
            promedio_letra: promedio.letra,
            promedio_valor: promedio.valor,
            publicado: false,
          },
        ]);

        if (error) {
          console.log("Error al guardar detalle:", error);
          alert("No se pudo guardar una de las notas");
          return false;
        }
      }
    }

    await cargarTodoDeAsignatura(Number(asignaturaSeleccionadaId));

    if (mostrarMensaje) {
      alert("Notas guardadas correctamente");
    }

    return true;
  };

  const publicarNotas = async () => {
    if (!calificacionSeleccionada) {
      alert("Selecciona una calificación");
      return;
    }

    const ok = await guardarNotas(false);
    if (!ok) return;

    const { error: errorDetalle } = await supabase
      .from("detalle_calificaciones")
      .update({
        publicado: true,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("calificacion_id", calificacionSeleccionada.id);

    if (errorDetalle) {
      console.log("Error al publicar detalles:", errorDetalle);
      alert("No se pudieron publicar las notas");
      return;
    }

    const { error: errorCalificacion } = await supabase
      .from("calificaciones")
      .update({
        estado: "Publicado",
      })
      .eq("id", calificacionSeleccionada.id);

    if (errorCalificacion) {
      console.log("Error al actualizar estado:", errorCalificacion);
      alert("No se pudo actualizar el estado de la calificación");
      return;
    }

    await cargarTodoDeAsignatura(Number(asignaturaSeleccionadaId));
    alert("Notas publicadas correctamente");
  };

  const promedioGeneralUnidad = useMemo(() => {
    if (estudiantes.length === 0) {
      return { letra: "-", valor: 0 };
    }

    const promedios = estudiantes
      .map((est) => obtenerPromedioUnidad(est.id).valor)
      .filter((valor) => valor > 0);

    if (promedios.length === 0) {
      return { letra: "-", valor: 0 };
    }

    const suma = promedios.reduce((acc, valor) => acc + valor, 0);
    const promedio = suma / promedios.length;

    return {
      letra: convertirValorALetra(promedio),
      valor: Number(promedio.toFixed(2)),
    };
  }, [estudiantes, detalles, notasSeleccionadas, unidadSeleccionada, calificacionSeleccionadaId]);

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
        <h1 style={{ margin: 0, color: "#1e3c72" }}>Registro de Notas</h1>
        <p style={{ marginTop: "8px", color: "#666" }}>
          Registra la calificación activa del momento.
        </p>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "18px",
            alignItems: "end",
          }}
        >
          <div>
            <label style={labelStyle}>Asignatura creada</label>
            <select
              value={asignaturaSeleccionadaId}
              onChange={(e) => {
                setAsignaturaSeleccionadaId(e.target.value);
                setUnidadSeleccionada("");
                setCalificacionSeleccionadaId("");
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
              value={unidadSeleccionada}
              onChange={(e) => {
                setUnidadSeleccionada(e.target.value);
                setCalificacionSeleccionadaId("");
              }}
              style={inputStyle}
            >
              <option value="">Seleccione una unidad</option>
              <option value="Unidad 1">Unidad 1</option>
              <option value="Unidad 2">Unidad 2</option>
              <option value="Unidad 3">Unidad 3</option>
              <option value="Unidad 4">Unidad 4</option>
            </select>
          </div>

          <div>
            <button onClick={abrirFormularioCalificacion} style={btnPrimary}>
              + Crear calificación
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={abrirFormularioEditar}
              disabled={!calificacionSeleccionada}
              style={{
                ...btnGray,
                backgroundColor: !calificacionSeleccionada ? "#9aa0a6" : "#007bff",
                cursor: !calificacionSeleccionada ? "not-allowed" : "pointer",
              }}
            >
              Editar asunto
            </button>

            <button
              onClick={eliminarCalificacion}
              disabled={!calificacionSeleccionada}
              style={{
                ...btnGray,
                backgroundColor: !calificacionSeleccionada ? "#9aa0a6" : "#dc3545",
                cursor: !calificacionSeleccionada ? "not-allowed" : "pointer",
              }}
            >
              Eliminar
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
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
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

      {asignaturaSeleccionada && unidadSeleccionada && (
        <div style={cardStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "18px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle}>Calificación activa</label>
              <select
                value={calificacionSeleccionadaId}
                onChange={(e) => setCalificacionSeleccionadaId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccione una calificación</option>
                {calificacionesDeUnidad.map((cal) => (
                  <option key={cal.id} value={cal.id}>
                    {cal.asunto}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Competencia</label>
              <input
                type="text"
                value={
                  calificacionSeleccionada
                    ? obtenerNombreCompetencia(calificacionSeleccionada.competencia_id)
                    : ""
                }
                readOnly
                style={readOnlyStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Capacidad</label>
              <input
                type="text"
                value={
                  calificacionSeleccionada
                    ? obtenerNombreCapacidad(calificacionSeleccionada.capacidad_id)
                    : ""
                }
                readOnly
                style={readOnlyStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Estado</label>
              <input
                type="text"
                value={calificacionSeleccionada ? calificacionSeleccionada.estado : ""}
                readOnly
                style={readOnlyStyle}
              />
            </div>
          </div>
        </div>
      )}

      {calificacionSeleccionada && (
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
              <h2 style={{ margin: 0, color: "#333" }}>
                Registro actual de notas
              </h2>
              <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                Asunto: {calificacionSeleccionada.asunto}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => guardarNotas()} style={btnPrimarySmall}>
                Guardar notas
              </button>
              <button onClick={publicarNotas} style={btnSuccessSmall}>
                Publicar notas
              </button>
            </div>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#eef4ff" }}>
                <th style={thStyle}>DNI</th>
                <th style={thStyle}>Estudiante</th>
                <th style={thStyle}>Nota</th>
                <th style={thStyle}>Promedio Unidad Letra</th>
                <th style={thStyle}>Promedio Unidad Valor</th>
              </tr>
            </thead>

            <tbody>
              {estudiantes.length > 0 ? (
                estudiantes.map((estudiante) => {
                  const promedio = obtenerPromedioUnidad(estudiante.id);

                  return (
                    <tr key={estudiante.id}>
                      <td style={tdStyle}>{estudiante.dni}</td>
                      <td style={tdStyle}>
                        {estudiante.apellidos}, {estudiante.nombres}
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={notasSeleccionadas[estudiante.id] || ""}
                          onChange={(e) =>
                            cambiarNota(estudiante.id, e.target.value)
                          }
                          style={selectNotaStyle}
                        >
                          <option value="">Seleccione</option>
                          <option value="AD">AD</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="NR">NR</option>
                        </select>
                      </td>
                      <td style={tdResume}>{promedio.letra}</td>
                      <td style={tdResume}>
                        {promedio.valor === 0 ? "-" : promedio.valor}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td style={tdStyle} colSpan={5}>
                    No hay estudiantes registrados en esta asignatura
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {unidadSeleccionada && (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: "#333" }}>Resumen actual de la unidad</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "14px",
              marginTop: "15px",
            }}
          >
            <div style={summaryCard("#dbeafe")}>
              <strong>Unidad</strong>
              <div>{unidadSeleccionada || "-"}</div>
            </div>
            <div style={summaryCard("#ede9fe")}>
              <strong>Calificaciones creadas</strong>
              <div>{calificacionesDeUnidad.length}</div>
            </div>
            <div style={summaryCard("#dcfce7")}>
              <strong>Promedio Letra</strong>
              <div>{promedioGeneralUnidad.letra}</div>
            </div>
            <div style={summaryCard("#fef3c7")}>
              <strong>Promedio Valor</strong>
              <div>
                {promedioGeneralUnidad.valor === 0 ? "-" : promedioGeneralUnidad.valor}
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarFormularioEditar && (
        <div style={overlayStyle}>
          <div
            style={{
              backgroundColor: "white",
              width: "600px",
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
              <h2 style={{ margin: 0 }}>Editar asunto</h2>

              <button onClick={cerrarFormularioEditar} style={closeButtonStyle}>
                ×
              </button>
            </div>

            <div style={{ padding: "25px" }}>
              <div>
                <label style={labelStyle}>Nuevo asunto</label>
                <input
                  type="text"
                  value={asuntoEditado}
                  onChange={(e) => setAsuntoEditado(e.target.value)}
                  style={inputStyle}
                  placeholder="Ejemplo: exposición, práctica, maqueta..."
                />
              </div>

              <div
                style={{
                  marginTop: "25px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <button onClick={actualizarAsunto} style={btnPrimarySmall}>
                  Guardar cambios
                </button>

                <button onClick={cerrarFormularioEditar} style={btnGraySmall}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarFormularioCalificacion && (
        <div style={overlayStyle}>
          <div
            style={{
              backgroundColor: "white",
              width: "800px",
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
              <h2 style={{ margin: 0 }}>Crear calificación</h2>

              <button onClick={cerrarFormularioCalificacion} style={closeButtonStyle}>
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
                  <label style={labelStyle}>Unidad</label>
                  <select
                    value={unidadFormulario}
                    onChange={(e) => setUnidadFormulario(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Seleccione una unidad</option>
                    <option value="Unidad 1">Unidad 1</option>
                    <option value="Unidad 2">Unidad 2</option>
                    <option value="Unidad 3">Unidad 3</option>
                    <option value="Unidad 4">Unidad 4</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Competencia</label>
                  <select
                    value={competenciaId}
                    onChange={(e) => {
                      setCompetenciaId(e.target.value);
                      setCapacidadId("");
                    }}
                    style={inputStyle}
                  >
                    <option value="">Seleccione una competencia</option>
                    {competenciasDeArea.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Capacidad</label>
                  <select
                    value={capacidadId}
                    onChange={(e) => setCapacidadId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Seleccione una capacidad</option>
                    {capacidadesDeCompetencia.map((cap) => (
                      <option key={cap.id} value={cap.id}>
                        {cap.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Asunto de la nota</label>
                  <input
                    type="text"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    style={inputStyle}
                    placeholder="Ejemplo: exposición, práctica, maqueta..."
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
                <button onClick={guardarCalificacion} style={btnPrimarySmall}>
                  Guardar
                </button>

                <button onClick={cerrarFormularioCalificacion} style={btnGraySmall}>
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

const readOnlyStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  boxSizing: "border-box" as const,
  backgroundColor: "#f1f5f9",
  cursor: "not-allowed",
};

const selectNotaStyle = {
  width: "120px",
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
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
  color: "#333",
  textAlign: "center" as const,
};

const tdResume = {
  padding: "12px",
  border: "1px solid #ddd",
  color: "#333",
  textAlign: "center" as const,
  backgroundColor: "#f0fdf4",
  fontWeight: "bold",
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
  width: "100%",
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
  width: "100%",
};

const btnPrimarySmall = {
  backgroundColor: "#17a2b8",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnGraySmall = {
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnSuccessSmall = {
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  padding: "12px 22px",
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
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  fontSize: "22px",
  cursor: "pointer",
  color: "#666",
};

const summaryCard = (backgroundColor: string) => ({
  backgroundColor,
  borderRadius: "10px",
  padding: "14px",
  textAlign: "center" as const,
  fontSize: "18px",
});