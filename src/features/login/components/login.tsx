import LoginWithGoogle from "./loginWithGoogle";
import Banner from "./banner";
import { useAuthContext } from "@/stores/authContext";
import { useNavigate } from "react-router";

export default function Login() {
    const { credentials, sessionIsChecked } = useAuthContext();
    const navigate = useNavigate();

    // in-flight
    if (!sessionIsChecked) return <div>Loading...</div>;

    if (credentials) {
        navigate("/dashboard");
    }

    return (
        <>
            <Banner/>
            <LoginWithGoogle/>
        </>
    )
}