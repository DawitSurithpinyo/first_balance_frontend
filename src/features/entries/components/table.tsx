import { useTransactions } from "@/stores/transactionsStore"
import { useAuthContext } from "@/stores/authContext"
import { type Transaction,
    type TransactionsSortKeys,
    type TransactionsEditableFields
} from "@/types/transactions"
import { sortTransactionsByStringKey, 
    sortTransactionsByNumericKey, 
    sortTransactionsByDateKey
} from "@/utils/sortTransactions"
import { useTransactionsHandling } from "@/features/entries/stores/transactionsHandling"
import { validateString, parseStringToNumber, 
    parseStringToDate, validateDateString, 
    validateOptionalString 
} from "@/features/entries/utils/validateInputs"
import patchTransaction from "@/features/entries/lib/patchTransaction"

import { useState } from "react"

export default function Table() {
    const { csrfToken } = useAuthContext()
    const transactions = useTransactions((state) => state.transactions)
    const setTransactionsNeedRefetch = useTransactions((state) => state.setNeedRefetch)
    const updateOneTransaction = useTransactions((state) => state.updateOneTransaction)

    const sortKey = useTransactionsHandling((state) => state.sortKey)
    const sortAscending = useTransactionsHandling((state) => state.sortAscending)

    const [editedValue, setEditedValue] = useState<string | number | Date | null>(null)
    function handleCellChange(e: React.FormEvent<HTMLInputElement>): void {
        setEditedValue(e.currentTarget.value)
    }

    async function handleCellSubmit(
        editedField: TransactionsEditableFields,
        transactionID: string
    ): Promise<void> {
        try {
            if (editedValue == null) {
                // cell hasn't been edited
                return
            }

            // For holding the updated + validated value to be assigned to Zustand after successful API call
            // assigning the updated value to useState's editedValue via setEditedValue doesn't actually work
            // because editedValue is from useState(), which is asynchronous. 
            // So it won't actually change immediately (not until the next render), which is way after the API call.
            // Within this function, editedValue would still be the old, not-yet-validated string assigned by handleCellChange()
            // when the user was still typing changes to the cell.
            let newStateValue: string | number | Date | null = null

            // validation + build request body
            const newTransaction: Partial<Transaction> = {
                transactionID: transactionID
            }
            switch (editedField) {
                case "transactionName": {
                    let validated = validateString(editedValue)
                    newTransaction.transactionName = validated
                    newStateValue = validated
                    break
                }
                case "accountID": {
                    let validated = validateString(editedValue)
                    newTransaction.accountID = validated
                    newStateValue = validated
                    break
                }
                case "value": {
                    let parsed = parseStringToNumber(editedValue)
                    newTransaction.value = parsed
                    newStateValue = parsed
                    break
                }
                case "date": {
                    let temp = validateDateString(editedValue, "MM/dd/yyyy")
                    let parsed = parseStringToDate(temp)
                    newTransaction.date = parsed
                    newStateValue = parsed
                    break
                }
                case "memo": {
                    let temp = validateOptionalString(editedValue)
                    let normalized = temp === "" ? null : temp
                    newTransaction.memo = normalized
                    newStateValue = normalized
                    break
                }
            }

            await patchTransaction(newTransaction, csrfToken ?? "")
            setTransactionsNeedRefetch(true)
            updateOneTransaction(transactionID, editedField, newStateValue)
            setEditedValue(null)
        }
        catch (e) {
            console.log(e)
        }
    }

    function displayRows(
        transactions: Transaction[],
        sortKey: TransactionsSortKeys = "date",
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
                    <tr key={t.transactionID}>
                        <td>
                            <input
                                defaultValue={t.transactionName}
                                onInput={e => handleCellChange(e)}
                                onBlur={() => handleCellSubmit("transactionName", t.transactionID)}
                                onKeyDown={(e) => {
                                    if (e.key == "Enter") {
                                        handleCellSubmit("transactionName", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                defaultValue={t.accountID}
                                onInput={e => handleCellChange(e)}
                                onBlur={() => handleCellSubmit("accountID", t.transactionID)}
                                onKeyDown={(e) => {
                                    if (e.key == "Enter") {
                                        handleCellSubmit("accountID", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                defaultValue={t.value.toString()}
                                onInput={e => handleCellChange(e)}
                                onBlur={() => handleCellSubmit("value", t.transactionID)}
                                onKeyDown={(e) => {
                                    if (e.key == "Enter") {
                                        handleCellSubmit("value", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                defaultValue={t.date.toLocaleDateString()}
                                onInput={e => handleCellChange(e)}
                                onBlur={() => handleCellSubmit("date", t.transactionID)}
                                onKeyDown={(e) => {
                                    if (e.key == "Enter") {
                                        handleCellSubmit("date", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                defaultValue={t.memo ?? ""}
                                onInput={e => handleCellChange(e)}
                                onBlur={() => handleCellSubmit("memo", t.transactionID)}
                                onKeyDown={(e) => {
                                    if (e.key == "Enter") {
                                        handleCellSubmit("memo", t.transactionID)
                                    }
                                }}
                            />
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
                    <th>Date (MM/dd/yyyy)</th>
                    <th>Memo</th>
                </tr>
            </thead>
            <tbody>
                {displayRows(transactions, sortKey, sortAscending)}               
            </tbody>
        </table>
    )
}