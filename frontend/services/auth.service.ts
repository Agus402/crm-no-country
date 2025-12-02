const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const authService = {
    async login(email: string, password: string) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include",
        });

        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = "Error al iniciar sesión";
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.message === "Bad credentials") {
                    errorMessage = "Credenciales incorrectas. Verifique su email y contraseña.";
                } else if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch {
                // Si no es JSON, usar el texto plano si existe
                if (errorBody) errorMessage = errorBody;
            }
            throw new Error(errorMessage);
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
            const errorBody = await response.text();
            let errorMessage = "Error al registrarse";
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch {
                if (errorBody) errorMessage = errorBody;
            }
            throw new Error(errorMessage);
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
            const errorBody = await response.text();
            let errorMessage = "Error al registrar cuenta";
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch {
                if (errorBody) errorMessage = errorBody;
            }
            throw new Error(errorMessage);
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
            throw new Error("No hay sesión activa");
        }

        return response.json();
    },

    async logout() {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
    },
};
