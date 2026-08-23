import '@/features/setting/components/setting.css'

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
        <div id="main">
            <div id="left">
                <img 
                    src={displayProfilePic()} 
                    alt="Profile picture" 
                    referrerPolicy="no-referrer"
                />
            </div>
            <div id="right">
                <table>
                    <tbody>
                        <tr>
                            <td id="head">Email</td>
                            <td>{credentials?.userEmail}</td>
                        </tr>
                        <tr>
                            <td id="head">User name</td>
                            <td>{credentials?.userName}</td>
                        </tr>
                    </tbody>
                </table>
                <input
                    id="logout-btn"
                    type="button"
                    value="Logout"
                    onClick={async () => await handleLogout()}
                />
            </div>
        </div>
    )
}