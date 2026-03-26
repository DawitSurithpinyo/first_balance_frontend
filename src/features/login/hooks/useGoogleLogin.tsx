import { useGoogleLogin } from "@react-oauth/google";
import { googleUser, type GoogleUser } from "@/features/login/types/userAuth";
import { api } from "@/lib/api";

export function useGoogleLoginHook(
    onSuccessCallback: (cred: GoogleUser) => void,
    csrfToken: string,
    setCsrfTokenFunc: (token: string) => void
) {
    return useGoogleLogin({
        flow: 'auth-code',
        ux_mode: 'popup', // will fall back to 'redirect' if client's browser doesn't allow popup
        select_account: true,
        onSuccess: async (codeResponse) => {
            try {
                const result = await api.post(`auth/googleLogin`,
                    csrfToken,
                    setCsrfTokenFunc,
                    { code: codeResponse.code }
                )
                switch (result.type) {
                    case "success":
                        const u = googleUser.safeParse(result.data.data);
                        if (!u.success || u.data == undefined) {
                            console.log("Zod error, unexpected response data shape of this API endpoint:", u.error);
                            break;
                        }
                        onSuccessCallback(u.data);
                        break;
                    case "api_error":
                        console.log("API error:", result.error);
                        break;
                    case "validation_error":
                        console.log("Zod error, unexpected base API response shape:", result.error);
                        break;
                    case "unknown_error":
                        console.log("Unknown error:", result.error);
                        break;
                }
            }
            catch(error){
                console.log('Login failed: ', error)
            }
            
        },
        onError: errorResponse => {
            console.log("Auth error: ", errorResponse)
        }
    });
}