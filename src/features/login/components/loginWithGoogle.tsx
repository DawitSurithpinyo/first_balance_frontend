import './loginWithGoogle.css'
import { useGoogleLoginHook } from '../hooks/useGoogleLogin';
import { type GoogleUser } from '../types/userAuth';
import { useAuthContext } from "@/stores/authContext";
import { useNavigate } from 'react-router';

export default function LoginWithGoogle() {
    const {login:login, csrfToken, setCSRFToken} = useAuthContext();
    const navigate = useNavigate();

    // Callback to handle successful login
    const handleGoogleLoginSuccess = (cred: GoogleUser) => {
        login(cred);
        navigate("/dashboard");
    };
    const googleLogin = useGoogleLoginHook(
        handleGoogleLoginSuccess,
        csrfToken ?? "",
        setCSRFToken,
    );

    return (
        <button id="login-with-google-btn" onClick={googleLogin}>
            <img src="src/features/login/assets/google_logo.png" id="google-logo"></img>
            <span id="google-login-text">Login with Google</span>
        </button>
    )
}

