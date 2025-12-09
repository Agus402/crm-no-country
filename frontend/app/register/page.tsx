"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, ArrowRight, Building2, User, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { registerAccount } = useAuth();
  const [step, setStep] = useState(1);

  // Estado para datos
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "company",
    companyName: "",
    industry: "",
    website: "",
    phone: ""
  });

  // Estado para errores
  const [errors, setErrors] = useState({
    password: "",
    phone: "",
    email: "",
    companyName: "",
    industry: "",
    submit: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors = { password: "", phone: "", email: "", companyName: "", industry: "", submit: "" };
    let hasError = false;

    // VALIDACIONES STEP 1
    if (step === 1) {
      // Email regex simple pero válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Ingrese una dirección de correo válida.";
        hasError = true;
      }

      if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
        hasError = true;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.password = "Las contraseñas no coinciden.";
        hasError = true;
      }

      setErrors(newErrors);
      if (hasError) return;

      // Si todo ok → avanzar
      setErrors({ password: "", phone: "", email: "", companyName: "", industry: "", submit: "" });
      setStep(2);
      return;
    }

    // 
    // VALIDACIONES STEP 2
    if (step === 2) {
      const phoneRegex = /^[0-9+\s()-]+$/; // permite números, +, espacios, ()

      const phoneDigits = formData.phone.replace(/\D/g, ""); // solo números reales

      // VALIDACIÓN NOMBRE EMPRESA
      if (formData.accountType === "company" && !formData.companyName.trim()) {
        newErrors.companyName = "El nombre de la empresa es obligatorio.";
        hasError = true;
      }

      // VALIDACIÓN INDUSTRIA
      if (!formData.industry) {
        newErrors.industry = "Debe seleccionar una industria.";
        hasError = true;
      }

      // TELÉFONO OBLIGATORIO
      if (!formData.phone.trim()) {
        newErrors.phone = "El número de teléfono es obligatorio.";
        hasError = true;
      } else if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "El número de teléfono contiene caracteres inválidos.";
        hasError = true;
      } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        newErrors.phone = "El número de teléfono debe tener entre 7 y 15 dígitos.";
        hasError = true;
      }

      setErrors(newErrors);
      if (hasError) return;

      // Si todo OK → submit
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        companyName: formData.companyName,
        industry: formData.industry,
        website: formData.website, // Incluir website
        phone: formData.phone,     // Incluir phone
        userName: formData.fullName,
        userEmail: formData.email,
        password: formData.password
      };
      await registerAccount(payload);
    } catch (error: any) {
      console.error("Registration failed", error);
      setErrors(prev => ({ ...prev, submit: error.message || "Error al registrar la cuenta. Intente nuevamente." }));
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto bg-linear-to-br from-purple-600 via-orange-500 to-purple-600 flex items-center justify-center rounded-xl text-white text-2xl mb-4 shadow-lg shadow-purple-200">
          ⚡
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
        <p className="text-sm text-gray-500 mt-1">
          {step === 1 ? "Start with your personal information" : "Tell us about your organization"}
        </p>
      </div>

      {/* PROGRESS BAR */}
      <div className="flex justify-center gap-2 mb-8">
        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-purple-600" : "bg-gray-200"}`} />
        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-purple-600" : "bg-gray-200"}`} />
      </div>

      {errors.submit && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 mb-6">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleNext} className="flex flex-col gap-4">

        {/* ------------------------- */}
        {/* STEP 1: PERSONAL INFO     */}
        {/* ------------------------- */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* FULL NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                <input
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-400"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@company.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-400"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-400"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-400"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
        )}

        {/* ------------------------- */}
        {/* STEP 2: COMPANY INFO      */}
        {/* ------------------------- */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* ACCOUNT TYPE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Account Type</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                <select
                  name="accountType"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all appearance-none text-gray-700"
                  value={formData.accountType}
                  onChange={handleChange}
                >
                  <option value="company">Company</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>

            {/* COMPANY NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">
                {formData.accountType === "client" ? "Business Name (Optional)" : "Company Name"}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                <input
                  name="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-400"
                  value={formData.companyName}
                  onChange={handleChange}
                  required={formData.accountType === "company"}
                />
              </div>
              {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
            </div>

            {/* INDUSTRY */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Industry</label>
              <select
                name="industry"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all text-gray-700"
                value={formData.industry}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select an industry</option>
                <option value="tech">Technology</option>
                <option value="marketing">Marketing Agency</option>
                <option value="ecommerce">E-commerce</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>
              {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
            </div>

            {/* WEBSITE + PHONE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Website (Optional)</label>
                <input
                  name="website"
                  type="text"
                  placeholder="www.site.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-400"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              {/* PHONE */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-400"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* BUTTONS */}
        <div className="mt-4 flex gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}

          <button
            type="submit"
            className="flex-1 bg-linear-to-r from-purple-600 via-orange-500 to-purple-600 text-white py-2.5 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {step === 1 ? (
              <>Continue to Company Info <ArrowRight className="h-4 w-4" /></>
            ) : (
              <>Create Account <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>

      </form>

      {/* FOOTER */}
      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-xs text-center text-gray-400 mt-4 px-4">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
