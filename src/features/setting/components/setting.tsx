import logoutAPI from "@/features/setting/lib/logout"

import { useAuthContext } from "@/stores/authContext"

export default function Setting() {
    const { credentials, logout, csrfToken, setCSRFToken } = useAuthContext()

    function displayProfilePic(): string {
        if (!credentials) {
            throw new Error("No credentials")
        }
        if (credentials.signUpChoice == "MANUAL") {
            return "src/features/setting/assets/profile_placeholder.png"
        }
        return credentials.userPictureLink
    }

    async function handleLogout() {
        try {
            await logoutAPI(csrfToken ?? "", setCSRFToken)
            logout()
        }
        catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <img src={displayProfilePic()} alt="Profile picture" />
            <span>Email: {credentials?.userEmail}</span>
            <span>Username: {credentials?.userName}</span>
            <input
                type="button"
                value="Logout"
                onClick={async () => await handleLogout()}
            />
        </>
    )
}