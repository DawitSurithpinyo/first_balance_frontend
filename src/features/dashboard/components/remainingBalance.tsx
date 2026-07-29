import { type Transaction } from "@/types/transactions"
import { useTransactions } from "@/stores/transactionsStore"

export default function RemainingBalance() {
    const transactions = useTransactions((state) => state.transactions)
    const calculateRemaining = (t: Transaction[]): number => {
        let remaining: number = 0
        for (let i = 0; i < t.length; i++) {
            remaining += t[i].value
        }
        return remaining
    }

    return (
        <div id="remaining">
            <strong>Remaining</strong>
            <span>{calculateRemaining(transactions).toFixed(2)}</span>
        </div>
    )
}