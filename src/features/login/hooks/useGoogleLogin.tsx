import { useGoogleLogin } from "@react-oauth/google";
import { type GoogleUser } from "@/features/login/types/userAuth";
import googleLogin from "@/features/login/lib/googleLogin";

export function useGoogleLoginHook(
    onSuccessCallback: (cred: GoogleUser) => void,
    csrfToken: string,
    setCsrfTokenFunc: (token: string) => void
) {
    return useGoogleLogin({
        flow: 'auth-code',
        ux_mode: 'popup', // will fall back to 'redirect' if client's browser doesn't allow popup
        select_account: true,
        state: csrfToken,
        onSuccess: async (codeResponse) => {
            await googleLogin(csrfToken, 
                setCsrfTokenFunc, 
                onSuccessCallback, 
                { code: codeResponse.code }
            )
        },
        onError: errorResponse => {
            console.log("Auth error: ", errorResponse)
        }
    });
}