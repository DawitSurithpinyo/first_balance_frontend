import defaultProfile from '../assets/profile_placeholder.png'
import logoutAPI from "@/features/setting/lib/logout"

import { useAuthContext } from "@/stores/authContext"
import { useTransactions } from '@/stores/transactionsStore'

export default function Setting() {
    const { credentials, logout, csrfToken, setCSRFToken } = useAuthContext()
    const setTransactionsNeedRefetch = useTransactions((state) => state.setNeedRefetch)

    function displayProfilePic(): string {
        if (!credentials) {
            throw new Error("No credentials")
        }
        if (credentials.signUpChoice == "MANUAL") {
            return defaultProfile
        }
        return credentials.userPictureLink
    }

    async function handleLogout() {
        try {
            await logoutAPI(
                csrfToken ?? "", 
                setCSRFToken,
                setTransactionsNeedRefetch
            )
            logout()
        }
        catch (e) {
            console.error(e)
        }
    }

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <img 
                src={displayProfilePic()} 
                alt="Profile picture" 
                referrerPolicy="no-referrer"
                style={{borderRadius: "50%", width: "35%"}}
            />
            <span>Email: {credentials?.userEmail}</span>
            <span>Username: {credentials?.userName}</span>
            <input
                type="button"
                value="Logout"
                onClick={async () => await handleLogout()}
            />
        </div>
    )
}