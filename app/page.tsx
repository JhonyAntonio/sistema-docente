"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const login = async () => {
    setMensaje("");

    if (!dni || !password) {
      setMensaje("Completa todos los campos.");
      return;
    }

    if (dni.length !== 8) {
      setMensaje("El DNI debe tener 8 dígitos.");
      return;
    }

    setCargando(true);

    try {
      const correoGenerado = `${dni}@pva.edu.pe`;

      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("correo", correoGenerado)
        .eq("estado", "Activo")
        .single();

      if (error || !usuario) {
        setMensaje("Usuario no encontrado.");
        setCargando(false);
        return;
      }

      if (usuario.password !== password) {
        setMensaje("Contraseña incorrecta.");
        setCargando(false);
        return;
      }

      localStorage.setItem("usuario_id", String(usuario.id));
      localStorage.setItem("usuario_dni", usuario.dni || "");
      localStorage.setItem("usuario_correo", usuario.correo || "");
      localStorage.setItem("usuario_rol", usuario.rol || "");
      localStorage.setItem(
        "usuario_estudiante_id",
        usuario.estudiante_id ? String(usuario.estudiante_id) : ""
      );

      if (usuario.rol === "docente") {
        router.push("/docente");
      } else if (usuario.rol === "estudiante") {
        router.push("/estudiante/panel");
      } else {
        setMensaje("Rol no válido.");
      }
    } catch (error) {
      setMensaje("Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #000000, #001f3f, #000000)",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
      }}
    >
      <div
        style={{
          backgroundColor: "#111",
          padding: "40px",
          borderRadius: "10px",
          width: "350px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#FFC300" }}>Sistema de Notas</h1>
        <p style={{ marginBottom: "20px" }}>IES PVA - Azángaro</p>

        <input
          type="text"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          maxLength={8}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        />

        {mensaje && (
          <p style={{ color: "#ff4d4f", marginBottom: "15px", fontSize: "14px" }}>
            {mensaje}
          </p>
        )}

        <button
          onClick={login}
          disabled={cargando}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#FFC300",
            color: "#000",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            opacity: cargando ? 0.7 : 1,
          }}
        >
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}