import { type Transaction } from "@/types/transactions"
import { useTransactions } from "@/stores/transactionsStore"

export default function TotalEarned() {
    const transactions = useTransactions((state) => state.transactions)
    const getTotalEarned = (transactions: Transaction[]): number => {
        let total: number = 0
        for(let i = 0; i < transactions.length; i++) {
            if(transactions[i].value > 0) {
                total += transactions[i].value
            }
        }
        return total
    }
    
    return (
        <>
            <span>Total earned</span>
            <span>{getTotalEarned(transactions).toString()}</span>
        </>
    )
}