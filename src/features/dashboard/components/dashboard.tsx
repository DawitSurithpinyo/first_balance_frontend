import RemainingBalance from "./remainingBalance"
import TotalSpent from "./totalSpent"
import TotalEarned from "./totalEarned"

import { useTransactions } from "@/stores/transactionsStore"
import getTransactions from "@/lib/getTransactions"
import { useEffect } from "react"

export default function Dashboard() {
    const transactions = useTransactions((state) => state.transactions)
    const transactionsNeedRefetch = useTransactions((state) => state.needRefetch)
    const loadTransactions = useTransactions((state) => state.loadTransactions)
    const setTransactionsNeedRefetch = useTransactions((state) => state.setNeedRefetch)

    useEffect(() => {
        const get = async () => {
            await getTransactions(loadTransactions, setTransactionsNeedRefetch)
        }
        if (transactionsNeedRefetch) {
            get()
        }
    }, [])
    
    if (transactions.length === 0) {
        return (
            <>
                <span>
                    {`You don't have any transactions yet.\n
                    Go to the entries page to create one.`}
                </span>
            </>
        )
    }
    return (
        <>
            <RemainingBalance/>
            <TotalSpent/>
            <TotalEarned/>
        </>
    )
}