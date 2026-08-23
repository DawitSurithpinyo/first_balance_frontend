import SignInWithGoogle from "./loginWithGoogle";
import Banner from "./banner";
import { useAuthContext } from "@/stores/authContext";
import { Navigate } from "react-router-dom";

export default function Login() {
    const { credentials, sessionIsChecked } = useAuthContext();

    // in-flight
    if (!sessionIsChecked) return <div>Loading...</div>;

    if (credentials) {
        return <Navigate to={"/dashboard"} />
    }

    return (
        <>
            <Banner/>
            <SignInWithGoogle/>
        </>
    )
}