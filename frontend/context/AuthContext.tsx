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
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await authService.login(email, password);
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
            const userData = await authService.getCurrentUser();
            setIsAuthenticated(true);
            setUser(userData);
            router.push("/");
        } catch (error) {
            console.error("Account Registration failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
        setIsAuthenticated(false);
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, registerAccount, logout, isAuthenticated, isLoading }}>
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
