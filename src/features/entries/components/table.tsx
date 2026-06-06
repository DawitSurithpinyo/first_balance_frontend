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
import deleteManyTransactions from "@/features/entries/lib/deleteManyTransactions"
import createTransaction from "@/features/entries/lib/createOneTransaction"
import type { CreateTransactionBody, CreateTransactionResponse } from "@/features/entries/types/createTransaction"
import { tempTransactionFormDefault, type TempTransactionForm } from "../types/tempTransactionForm"

import { useState } from "react"
import isEqual from 'lodash/isEqual';

export default function Table() {
    const { csrfToken } = useAuthContext()
    const transactions = useTransactions((state) => state.transactions)
    const setTransactionsNeedRefetch = useTransactions((state) => state.setNeedRefetch)
    const addOneTransaction = useTransactions((state) => state.addOneTransaction)
    const updateOneTransaction = useTransactions((state) => state.updateOneTransaction)
    const removeOneTransaction = useTransactions((state) => state.removeOneTransaction)
    const removeManyTransactions = useTransactions((state) => state.removeManyTransactions)
    const removeAllTransactions = useTransactions((state) => state.removeAllTransactions)

    const sortKey = useTransactionsHandling((state) => state.sortKey)
    const sortAscending = useTransactionsHandling((state) => state.sortAscending)

    // Checkboxes on each row
    const selectingTIDs = useTransactionsHandling((state) => state.selectingTIDs)
    const addOneSelectingTID = useTransactionsHandling((state) => state.addOneSelectingTID)
    const addManySelectingTIDs = useTransactionsHandling((state) => state.addManySelectingTIDs)
    const removeOneSelectingTID = useTransactionsHandling((state) => state.removeOneSelectingTID)
    const removeManySelectingTID = useTransactionsHandling((state) => state.removeManySelectingTIDs)
    const removeAllSelectingTIDs = useTransactionsHandling((state) => state.removeAllSelectingTIDs)

    function handleSelectCheckbox(e: React.ChangeEvent<HTMLInputElement>, TID: string): void {
        if(e.currentTarget.checked) {
            addOneSelectingTID(TID)
            return
        }
        removeOneSelectingTID(TID)
    }

    function handleSelectAll(): void {
        let remainingTIDs: string[] = []
        for(let i = 0; i < transactions.length; i++) {
            if(selectingTIDs.includes(transactions[i].transactionID)) {
                continue
            }
            remainingTIDs.push(transactions[i].transactionID)
        }
        addManySelectingTIDs(remainingTIDs)
    }

    function handleDeselectAll(): void {
        removeAllSelectingTIDs()
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

    async function handleDeleteManyOrAll(): Promise<void> {
        try {
            if (selectingTIDs.length === 0) {
                return
            }
            if (!selectingTIDs.every((tid) => transactions.map(t => t.transactionID).includes(tid))) {
                throw new Error("There are selected IDs that are not inside the actual list of transactions.")
            }

            if (selectingTIDs.length < transactions.length) {
                await deleteManyTransactions({transactionIDsList: selectingTIDs}, csrfToken ?? "")
                setTransactionsNeedRefetch(true)
                removeManySelectingTID(selectingTIDs)
                removeManyTransactions(selectingTIDs)
                return
            }
            await deleteManyTransactions({transactionIDsList: transactions.map(t => t.transactionID)}, csrfToken ?? "")
            setTransactionsNeedRefetch(true)
            removeAllSelectingTIDs()
            removeAllTransactions()
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

    const [createIsEnabled, setCreateIsEnabled] = useState<boolean>(false)
    const [creatingTransaction, setCreatingTransaction] = useState<TempTransactionForm>(tempTransactionFormDefault)

    function handleCreateTransactionChange(
        val: string,
        field: TransactionsEditableFields
    ): void {
        setCreatingTransaction(t => ({...t, [field]: val}))
    }

    function handleCancelOrFinishCreateTransaction(): void {
        setCreateIsEnabled(false)
        setCreatingTransaction(tempTransactionFormDefault)
    }

    async function handleConfirmCreateTransaction(): Promise<void> {
        try {
            if (isEqual(creatingTransaction, tempTransactionFormDefault)) {
                // Don't do anything if all fields are empty
                return
            }
            let finalT: CreateTransactionBody = {
                transactionName: '',
                accountID: '',
                value: 0,
                date: new Date(),
                memo: null
            }

            // validation
            finalT.transactionName = validateString(creatingTransaction.transactionName)
            finalT.accountID = validateString(creatingTransaction.accountID)
            finalT.value = parseStringToNumber(creatingTransaction.value)

            let tempDate = validateDateString(creatingTransaction.date, "MM/dd/yyyy")
            finalT.date = parseStringToDate(tempDate)

            let tempMemo = validateOptionalString(creatingTransaction.memo ?? "")
            finalT.memo = tempMemo === "" ? null : tempMemo

            // API call
            const res: CreateTransactionResponse = await createTransaction(finalT, csrfToken ?? "")
            const successTransaction: Transaction = {
                transactionID: res.insertedID,
                transactionName: finalT.transactionName,
                accountID: finalT.accountID,
                value: finalT.value,
                date: finalT.date,
                memo: finalT.memo
            }
            addOneTransaction(successTransaction)
            setTransactionsNeedRefetch(true)
            handleCancelOrFinishCreateTransaction()
        }
        catch (e) {
            console.log(e)
        }
    }

    function displayCreateTransactionForm(): React.ReactNode {
        if (!createIsEnabled) {
            return (
                <></>
            )
        }
        return (
            <div style={{display: "flex"}}>
                <input 
                    type="text"
                    placeholder="Name"
                    onInput={e => handleCreateTransactionChange(e.currentTarget.value, "transactionName")}
                />
                <input 
                    type="text"
                    placeholder="Account ID"
                    onInput={e => handleCreateTransactionChange(e.currentTarget.value, "accountID")}
                />
                <input 
                    type="text"
                    placeholder="Value (any number)"
                    onInput={e => handleCreateTransactionChange(e.currentTarget.value, "value")}
                />
                <input 
                    type="text"
                    placeholder="Date (MM/dd/yyyy)"
                    onInput={e => handleCreateTransactionChange(e.currentTarget.value, "date")}
                />
                <input 
                    type="text"
                    placeholder="Memo"
                    onInput={e => handleCreateTransactionChange(e.currentTarget.value, "memo")}
                />
                <input
                    type="button"
                    value="Submit"
                    onClick={async () => await handleConfirmCreateTransaction()}
                />
                <input
                    type="button"
                    value="Cancel"
                    onClick={() => handleCancelOrFinishCreateTransaction()}
                />
            </div>
        )
    }

    function displaySelectOptions(): React.ReactNode {
        if (transactions.length === 0) {
            return (
                <></>
            )
        }
        if (selectingTIDs.length === 0) {
            return (
                <input 
                    type="submit"
                    value="Select all"
                    onClick={() => handleSelectAll()}
                />
            )
        }
        else if (selectingTIDs.length > 0 && selectingTIDs.length < transactions.length) {
            // Only some rows selected
            return (
                <>
                    <input 
                        type="submit"
                        value="Select all"
                        onClick={() => handleSelectAll()}
                    />
                    <input 
                        type="submit"
                        value="Deselect all"
                        onClick={() => handleDeselectAll()}
                    />
                </>
            )
        }
        else if (selectingTIDs.length === transactions.length) {
            return (
                <input 
                    type="submit"
                    value="Deselect all"
                    onClick={() => handleDeselectAll()}
                />
            )
        }
    }

    function displayDeleteEntriesButton(): React.ReactNode {
        if (selectingTIDs.length === 0) {
            return (
                <></>
            )
        }
        return (
            <input 
                type="submit"
                value="Delete all selected"
                onClick={async () => await handleDeleteManyOrAll()}
            />         
        )
    }

    return (
        <>
            {displaySelectOptions()}
            {displayDeleteEntriesButton()}
            <input 
                type="button" 
                value="Create a new entry"
                disabled={createIsEnabled}
                onClick={() => setCreateIsEnabled(true)}
            />
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
            {displayCreateTransactionForm()}
        </>
    )
}