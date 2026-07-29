import { type Transaction } from "@/types/transactions"
import { useTransactions } from "@/stores/transactionsStore"

export default function TotalSpent() {
    const transactions = useTransactions((state) => state.transactions)
    const getTotalSpent = (transactions: Transaction[]): number => {
        let total: number = 0
        for(let i = 0; i < transactions.length; i++) {
            if(transactions[i].value < 0) {
                total += transactions[i].value * -1
            }
        }
        return total
    }

    return (
        <div id="spent">
            <strong>Total spent</strong>
            <span>{getTotalSpent(transactions).toFixed(2)}</span>
        </div>
    )
}