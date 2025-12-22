import React, { createContext, useContext, useState } from "react";
import { type GoogleUser, type NormalUser } from "@/features/login/types/userAuth";


export interface createAuthContextState {
    credentials: GoogleUser | NormalUser | null
    csrfToken: string | null
    login: (cred: GoogleUser | NormalUser) => void
    logout: () => void
    setCSRFToken: (token: string) => void
}


const AuthContext = createContext<createAuthContextState | undefined>(undefined);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if(!context) {
      throw new Error('AuthContext must be used inside AuthContext Provider');
    }
    return context;
};

export function AuthProvider({children}: {children:React.ReactNode}) {
    const [credentials, setCredentials] = useState<GoogleUser | NormalUser | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    const login = (cred: GoogleUser | NormalUser) => {
        setCredentials(cred);
        return;
    };

    const logout = () => {
        setCredentials(null);
        return;
    };

    const setCSRFToken = (token: string) => {
        if (token === null || token === undefined) {
            throw new Error('CSRF token must not be null to set token');
        }
        setCsrfToken(token);
    }

    return(
        <AuthContext.Provider value={{credentials, csrfToken, setCSRFToken, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}