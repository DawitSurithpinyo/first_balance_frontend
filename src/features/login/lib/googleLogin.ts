import { api } from '@/lib/api';
import { googleUser, type GoogleUser } from '../types/userAuth';

interface reqBody {
    code: string
}

export default async function googleLogin(
    csrfToken: string,
    setCsrfTokenFunc: (t: string) => void,
    onSuccessCallback: (cred: GoogleUser) => void,
    body: reqBody
): Promise<void> {
    try {
        const result = await api.post(`auth/googleLogin`,
            csrfToken,
            setCsrfTokenFunc,
            { code: body.code }
        )
        
        switch (result.type) {
            case "success":
                const u = googleUser.safeParse(result.data.data);
                if (!u.success || u.data == undefined) {
                    console.log("Zod error, unexpected response data shape of this API endpoint:", u.error);
                    return
                }
                onSuccessCallback(u.data);
                return
            case "api_error":
                console.log("API error:", result.error);
                return
            case "validation_error":
                console.log("Zod error, unexpected base API response shape:", result.error);
                return
            case "unknown_error":
                console.log("Unknown error:", result.error);
                return
        }
    }
    catch (e) {
        console.log('Login failed: ', e)
    }
}