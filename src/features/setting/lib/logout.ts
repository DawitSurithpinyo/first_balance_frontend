import { api } from "@/lib/api"

export default async function logoutAPI(
    csrfToken: string,
    setCsrfToken: (t: string) => void
): Promise<void> {
    const result = await api.post('auth/logout', csrfToken, setCsrfToken)
    if (result.type != "success") {
        throw new Error(result.error.message)
    }
}