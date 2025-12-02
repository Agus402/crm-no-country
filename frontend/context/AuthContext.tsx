"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

interface AuthContextType {
    user: any;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    registerAccount: (data: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData); // O lo que devuelva el endpoint /me
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
            }
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await authService.login(email, password);
            // El token ya está en la cookie, validamos sesión
            const userData = await authService.getCurrentUser();
            setIsAuthenticated(true);
            setUser(userData);
            router.push("/");
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            await authService.register(data);
            // El token ya está en la cookie
            const userData = await authService.getCurrentUser();
            setIsAuthenticated(true);
            setUser(userData);
            router.push("/");
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const registerAccount = async (data: any) => {
        try {
            await authService.registerAccount(data);
            // El token ya está en la cookie
            const userData = await authService.getCurrentUser();
            setIsAuthenticated(true);
            setUser(userData);
            router.push("/");
        } catch (error) {
            console.error("Account Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        // Idealmente llamar a un endpoint de logout para borrar la cookie en el servidor
        // Por ahora borramos el estado local. La cookie persistirá hasta que expire o se borre.
        // TODO: Implementar endpoint de logout en backend
        setIsAuthenticated(false);
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, registerAccount, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
