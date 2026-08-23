import './loginWithGoogle.css'
import googleLogo from '../assets/google_logo.png'
import { useGoogleLoginHook } from '../hooks/useGoogleLogin';
import { type GoogleUser } from '../types/userAuth';
import { useAuthContext } from "@/stores/authContext";
import { useNavigate } from 'react-router';

export default function SignInWithGoogle() {
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
            <img src={googleLogo} id="google-logo"></img>
            <span id="google-login-text">Sign in with Google</span>
        </button>
    )
}

