import { type Transaction } from "@/types/transactions"
import { useTransactions } from "@/stores/transactionsStore"

export default function RemainingBalance() {
    const transactions = useTransactions((state) => state.transactions)
    const calculateRemaining = (t: Transaction[]): Number => {
        var remaining: number = 0
        for (let i = 0; i < t.length; i++) {
            remaining += t[i].value
        }
        return remaining
    }

    return (
        <>
            <span>Remaining</span>
            <span>{calculateRemaining(transactions).toString()}</span>
        </>
    )
}