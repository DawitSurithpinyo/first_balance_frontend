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
import deleteOneTransaction from "@/features/entries/lib/deleteOneTransaction"

import { useState } from "react"

export default function Table() {
    const { csrfToken } = useAuthContext()
    
    const transactions = useTransactions((state) => state.transactions)
    const setTransactionsNeedRefetch = useTransactions((state) => state.setNeedRefetch)
    const updateOneTransaction = useTransactions((state) => state.updateOneTransaction)
    const removeOneTransaction = useTransactions((state) => state.removeOneTransaction)

    const sortKey = useTransactionsHandling((state) => state.sortKey)
    const sortAscending = useTransactionsHandling((state) => state.sortAscending)

    // Checkboxes on each row
    const selectingTIDs = useTransactionsHandling((state) => state.selectingTIDs)
    const addOneSelectingTID = useTransactionsHandling((state) => state.addOneSelectingTID)
    const removeOneSelectingTID = useTransactionsHandling((state) => state.removeOneSelectingTID)

    function handleSelectCheckbox(e: React.ChangeEvent<HTMLInputElement>, TID: string): void {
        if(e.currentTarget.checked) {
            addOneSelectingTID(TID)
            return
        }
        removeOneSelectingTID(TID)
    }

    async function handleDeleteOne(TID: string): Promise<void> {
        try {
            if (TID == "") {
                return
            }
            if (transactions.map(t => t.transactionID).indexOf(TID) === -1) {
                throw new Error(`ID ${TID} is not in the transactions list`)
            }

            await deleteOneTransaction({transactionID: TID}, csrfToken ?? "")
            setTransactionsNeedRefetch(true)
            removeOneSelectingTID(TID)
            removeOneTransaction(TID)
        }
        catch (e) {
            console.log(e)
        }
    }

    // Table cell states
    const [originalValue, setOriginalValue] = useState<string | null>(null)
    function handleCellFocus(e: React.FocusEvent<HTMLInputElement, Element>): void {
        setOriginalValue(e.currentTarget.value)
    }

    const [editedValue, setEditedValue] = useState<string | null>(null)
    function handleCellChange(e: React.FormEvent<HTMLInputElement>): void {
        setEditedValue(e.currentTarget.value)
    }

    async function handleCellSubmit(
        editedField: TransactionsEditableFields,
        transactionID: string
    ): Promise<void> {
        try {
            if (editedValue == null || (originalValue == editedValue)) {
                // cell hasn't been edited, or the final edited value is same as original (no point updating)
                setEditedValue(null)
                setOriginalValue(null)
                return
            }
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
                default: {
                    throw new Error(`Invalid input for edited field: ${editedField}`)
                }
            }

            await patchTransaction(newTransaction, csrfToken ?? "")
            setTransactionsNeedRefetch(true)
            updateOneTransaction(transactionID, editedField, newStateValue)
            setOriginalValue(null)
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
                                type="checkbox"
                                checked={selectingTIDs.includes(t.transactionID)}
                                onChange={e => handleSelectCheckbox(e, t.transactionID)}
                            />
                        </td>
                        <td>
                            <input
                                defaultValue={t.transactionName}
                                onFocus={e => handleCellFocus(e)}
                                onInput={e => handleCellChange(e)}
                                onBlur={async () => await handleCellSubmit("transactionName", t.transactionID)}
                                onKeyDown={async (e) => {
                                    if (e.key == "Enter") {
                                       await handleCellSubmit("transactionName", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                defaultValue={t.accountID}
                                onFocus={e => handleCellFocus(e)}
                                onInput={e => handleCellChange(e)}
                                onBlur={async () => await handleCellSubmit("accountID", t.transactionID)}
                                onKeyDown={async (e) => {
                                    if (e.key == "Enter") {
                                        await handleCellSubmit("accountID", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                defaultValue={t.value.toString()}
                                onFocus={e => handleCellFocus(e)}
                                onInput={e => handleCellChange(e)}
                                onBlur={async () => await handleCellSubmit("value", t.transactionID)}
                                onKeyDown={async (e) => {
                                    if (e.key == "Enter") {
                                        await handleCellSubmit("value", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                defaultValue={t.date.toLocaleDateString()}
                                onFocus={e => handleCellFocus(e)}
                                onInput={e => handleCellChange(e)}
                                onBlur={async () => await handleCellSubmit("date", t.transactionID)}
                                onKeyDown={async (e) => {
                                    if (e.key == "Enter") {
                                        await handleCellSubmit("date", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                defaultValue={t.memo ?? ""}
                                onFocus={e => handleCellFocus(e)}
                                onInput={e => handleCellChange(e)}
                                onBlur={async () => await handleCellSubmit("memo", t.transactionID)}
                                onKeyDown={async (e) => {
                                    if (e.key == "Enter") {
                                        await handleCellSubmit("memo", t.transactionID)
                                    }
                                }}
                            />
                        </td>
                        <td>
                            <input 
                                type="submit" 
                                value="Delete"
                                onClick={async () => await handleDeleteOne(t.transactionID)}
                            />
                        </td>
                    </tr>
                )
            })
        )
    }

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Account ID</th>
                        <th>Value</th>
                        <th>Date</th>
                        <th>Memo (optional)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {displayRows(transactions, sortKey, sortAscending)}               
                </tbody>
            </table>
        </>
    )
}