import { useAuthContext } from "@/stores/authContext"

import { Navigate } from "react-router"

export default function NotFound() {
    const { credentials } = useAuthContext()

    if (!credentials) {
        return <Navigate to="/" replace/>
    }
    return (
        <Navigate to="/dashboard" replace/>
    )
}