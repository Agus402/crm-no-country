const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const authService = {
    async login(email: string, password: string) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include", // Importante para enviar/recibir cookies
        });

        if (!response.ok) {
            throw new Error("Error al iniciar sesión");
        }

        return response.json();
    },

    async register(data: any) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Error al registrarse");
        }

        return response.json();
    },

    async registerAccount(data: any) {
        const response = await fetch(`${API_URL}/auth/onboarding`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Error al registrar cuenta");
        }

        return response.json();
    },

    async getCurrentUser() {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("No authenticated");
        }

        return response.json();
    },
};
