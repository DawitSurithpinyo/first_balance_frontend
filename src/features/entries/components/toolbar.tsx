import { useTransactionsHandling } from "@/features/entries/stores/transactionsHandling"
import { useTransactions } from "@/stores/transactionsStore"
import type { TransactionsSortKeys } from "@/types/transactions"

export default function Toolbar() {
    const transactions = useTransactions((state) => state.transactions)
    const setSortKey = useTransactionsHandling((state) => state.setSortKey)
    const setSortAsc = useTransactionsHandling((state) => state.setSortAsc)

    function handleSubmitSortKey(key: TransactionsSortKeys): void {
        if (!['transactionName', 'accountID', 'value', 'date', 'memo'].includes(key.toString())) {
            console.error("Input for transactions sorting key should be one of the following: 'transactionName', 'accountID', 'value', 'date', 'memo'")
            return
        }
        setSortKey(key)
    }
    function handleSubmitSortAsc(asc: string): void {
        let ascLow = asc.toLowerCase()
        if (ascLow != 'true' && ascLow != 'false') {
            console.error("Input for setting whether to sort transactions ascending should be 'true' or 'false' only.")
            return
        }
        setSortAsc(ascLow === 'true')
    }

    return (
        (transactions.length === 0)
            ? <></>
            : <>
                <label htmlFor="sortKey">Sort by:</label>
                <select id="sortKey" defaultValue="date" onChange={e => handleSubmitSortKey(e.target.value as TransactionsSortKeys)}>
                    <option value="transactionName">transaction name</option>
                    <option value="accountID">account ID</option>
                    <option value="value">value</option>
                    <option value="date">date</option>
                    <option value="memo">memo</option>
                </select>
                <label htmlFor="sortAsc">Sort ascending</label>
                <select id="sortAsc" defaultValue="true" onChange={e => handleSubmitSortAsc(e.target.value)}>
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
            </>
    )
}