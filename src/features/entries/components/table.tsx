import { useTransactions } from "@/stores/transactionsStore"
import type { Transaction } from "@/types/transactions"
import { sortTransactionsByStringKey, 
    sortTransactionsByNumericKey, 
    sortTransactionsByDateKey } from "@/utils/sortTransactions"

import { useState } from "react"

export default function Table() {
    const transactions = useTransactions((state) => state.transactions)
    const transactionsNeedRefetch = useTransactions((state) => state.needRefetch)

    const [selectedTID, setSelectedTID] = useState<string | null>(null)
    const [editingValue, setEditingValue] = useState<string | number | Date | null>(null)

    function displayRows(
        transactions: Transaction[],
        sortKey: keyof Transaction = "date",
        sortAscending: boolean = true
    ): React.ReactNode {
        try {
            switch (sortKey) {
                case "transactionName":
                    transactions = sortTransactionsByStringKey(transactions, "transactionName", sortAscending)
                    break
                case "accountID":
                    transactions = sortTransactionsByStringKey(transactions, "accountID", sortAscending)
                    break
                case "value":
                    transactions = sortTransactionsByNumericKey(transactions, "value", sortAscending)
                    break
                case "date":
                    transactions = sortTransactionsByDateKey(transactions, "date", sortAscending)
                    break
                case "memo":
                    transactions = sortTransactionsByStringKey(transactions, "memo", sortAscending)
                    break
            }
        }
        catch (e) {
            console.error(e)
        }

        return (
            transactions.map((t) => {
                return (
                    // plain <td editableContent="true"> "works", but React throws a glaring warning that
                    // you're allowing data to be edit not from top-down, so React can fail to update or render elements, and there can be consequences.
                    // Plus, using <input> makes it easy to handle onChange and all the events.
                    <tr key={t.transactionID}>
                        <td>
                            <input value={t.transactionName} />
                        </td>
                        <td>
                            <input value={t.accountID} />
                        </td>
                        <td>
                            <input value={t.value} />
                        </td>
                        <td>
                            <input value={t.date.toLocaleDateString()} />
                        </td>
                        <td>
                            <input value={t.memo ?? ""} />
                        </td>
                    </tr>
                )
            })
        )
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Account ID</th>
                    <th>Value</th>
                    <th>Date</th>
                    <th>Memo</th>
                </tr>
            </thead>
            <tbody>
                {displayRows(transactions)}               
            </tbody>
        </table>
    )
}