"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@example.com" && password === "123456") {
      document.cookie = "auth=true; path=/";
      router.push("/");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-linear-to-br from-purple-600 via-orange-500 to-purple-600 flex items-center justify-center rounded-lg text-white text-xl">
          ⚡
        </div>
        <div>
          <h1 className="text-lg font-semibold">Startup CRM</h1>
          <p className="text-sm text-gray-500">Smart Contact Management</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold">Iniciar sesión</h2>
      <p className="text-gray-600 mb-2">
        Accede a tu panel para gestionar contactos y clientes.
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          className="border border-gray-300 rounded-xl p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Contraseña</label>
        <input
          type="password"
          className="border border-gray-300 rounded-xl p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button className="bg-linear-to-r from-purple-600 via-orange-500 to-purple-600 text-white py-2 rounded-xl font-semibold mt-2 hover:opacity-90 transition">
        Entrar
      </button>

      <p className="text-sm text-center text-gray-600 mt-3">
        ¿No tienes una cuenta?{" "}
        <a href="/register" className="text-purple-600 font-medium hover:underline">
          Registrarse
        </a>
      </p>
    </form>
  );
}
