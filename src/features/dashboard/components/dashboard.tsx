import RemainingBalance from "./remainingBalance"
import { useTransactions } from "@/stores/transactionsStore"
import getTransactions from "@/lib/getTransactions"
import { useEffect } from "react"

export default function Dashboard() {
    const transactions = useTransactions((state) => state.transactions)
    const loadTransactions = useTransactions((state) => state.loadTransactions)

    useEffect(() => {
        const get = async () => {
            await getTransactions(loadTransactions)
        }
        get()
    }, [])
    
    if (transactions.length === 0) {
        return (
            <>
                <span>
                    You don't have any transactions yet.
                    Go to the entries page to create one.
                </span>
            </>
        )
    }
    return (
        <>
            <RemainingBalance/>
        </>
    )
}