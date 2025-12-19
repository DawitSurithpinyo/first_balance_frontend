import React, { createContext, use, useState } from "react";
import { type GoogleUser, type NormalUser } from "@/features/login/types/userAuth";


interface createAuthContextState {
    credentials: GoogleUser | NormalUser | null
    login: (cred: GoogleUser | NormalUser) => void
    logout: () => void
}


const AuthContext = createContext<createAuthContextState | undefined>(undefined);

export function useAuthContext() {
    const context = use(AuthContext);
    if(!context) {
      throw new Error('AuthContext must be used inside AuthContext Provider');
    }
    return context;
};

export function AuthProvider({children}: {children:React.ReactNode}) {
    const [credentials, setCredentials] = useState<GoogleUser | NormalUser | null>(null);

    const login = (cred: GoogleUser | NormalUser) => {
        setCredentials(cred);
        return;
    };

    const logout = () => {
        setCredentials(null);
        return;
    };

    return(
        <AuthContext value={{credentials, login, logout}}>
            {children}
        </AuthContext>
    )
}