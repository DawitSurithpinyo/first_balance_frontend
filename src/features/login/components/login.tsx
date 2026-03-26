import LoginWithGoogle from "./loginWithGoogle"
import { useAuthContext } from "@/stores/authContext"
import { useNavigate } from "react-router";

export default function Login() {
    const { credentials, sessionIsChecked } = useAuthContext();
    const navigate = useNavigate();

    if (!sessionIsChecked) return <div>Loading...</div>;

    if (credentials) {
        navigate("/dashboard");
    }

    return (
        <>
            <header>Login page</header>
            <LoginWithGoogle/>
        </>
    )
}