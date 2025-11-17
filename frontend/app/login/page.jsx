"use client";

import { useState } from "react";
import "./login.css"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:200/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Logo */}
        <div className="logo-box">
          <div className="logo-icon">⚡</div>
          <div>
            <h1 className="crm-title">Startup CRM</h1>
            <p className="crm-subtitle">Smart Contact Management</p>
          </div>
        </div>

        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-description">
          Accede a tu panel para gestionar contactos y clientes.
        </p>

        <form onSubmit={handleLogin} className="login-form">

          {/* Email */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

        
          <button type="submit" className="login-btn">Entrar</button>
        </form>

      
        <p className="login-footer">
          ¿No tienes una cuenta?{" "}
          <a href="#" className="admin-link">Contacta al administrador</a>
        </p>
      </div>
    </div>
  );
}
