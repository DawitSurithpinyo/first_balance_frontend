import RemainingBalance from "./remainingBalance"
import { useTransactions } from "@/stores/transactionsStore"
import getTransactions from "@/lib/getTransactions"
import { useEffect } from "react"
import type { Transaction } from "@/types/transactions"

export default function Dashboard() {
    const transactions = useTransactions((state) => state.transactions)
    const addToState = (res: Transaction[]) => { 
        useTransactions((state) => state.addManyTransactions(res)) 
    }

    useEffect(() => {
        const get = async () => {
            const res = await getTransactions()
            if (res) {
                // res == void on error cases
                addToState(res)
            }
        }
        get()
    }, [transactions])
    
    if (transactions.length == 0) {
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