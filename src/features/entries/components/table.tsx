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

import { useState } from "react"

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

    // create button on top (Toolbar) that always display
    // When clicked, button is disabled
    // display a "form" as one row with input textbox for each field at the bottom of the real table
    // with only one <td> row (date placeholder MM/dd/yyyy)
    // User enter data for each column, then have the confirm + cancel buttons on the right
    // On cancel, remove the form, enable the create button again.
    // On confirm, validate, call API, add to Zustand, enable create button again.
    const [createIsEnabled, setCreateIsEnabled] = useState<boolean>(false)
    const [creatingTName, setCreatingTName] = useState<string | null>(null)
    const [creatingTAccID, setCreatingTAccID] = useState<string | null>(null)
    const [creatingTValue, setCreatingTValue] = useState<string | null>(null)
    const [creatingTDate, setCreatingTDate] = useState<string | null>(null)
    const [creatingTMemo, setCreatingTMemo] = useState<string | null>(null)

    function handleCreateTransactionChange(
        e: React.FormEvent<HTMLInputElement>,
        field: TransactionsEditableFields
    ): void {
        switch (field) {
            case "transactionName": {
                setCreatingTName(e.currentTarget.value)
                break
            }
            case "accountID": {
                setCreatingTAccID(e.currentTarget.value)
                break
            }
            case "value": {
                setCreatingTValue(e.currentTarget.value)
                break
            }
            case "date": {
                setCreatingTDate(e.currentTarget.value)
                break
            }
            case "memo": {
                setCreatingTMemo(e.currentTarget.value)
            }
        }
    }

    function handleCancelCreateTransaction(): void {
        setCreateIsEnabled(false)
        setCreatingTName(null)
        setCreatingTAccID(null)
        setCreatingTValue(null)
        setCreatingTDate(null)
        setCreatingTMemo(null)
    }

    async function handleConfirmCreateTransaction(): Promise<void> {
        try {
            if (creatingTName == null && creatingTAccID == null &&
                creatingTValue == null && creatingTDate == null &&
                creatingTMemo == null
            ) {
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
            finalT.transactionName = validateString(creatingTName)
            finalT.accountID = validateString(creatingTAccID)
            finalT.value = parseStringToNumber(creatingTValue)

            let tempDate = validateDateString(creatingTDate, "MM/dd/yyyy")
            finalT.date = parseStringToDate(tempDate)

            let tempMemo = validateOptionalString(creatingTMemo ?? "")
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
            handleCancelCreateTransaction() // misleading name, just reusing function that calls state setters to set back to default
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
                    onInput={e => handleCreateTransactionChange(e, "transactionName")}
                />
                <input 
                    type="text"
                    placeholder="Account ID"
                    onInput={e => handleCreateTransactionChange(e, "accountID")}
                />
                <input 
                    type="text"
                    placeholder="Value (any number)"
                    onInput={e => handleCreateTransactionChange(e, "value")}
                />
                <input 
                    type="text"
                    placeholder="Date (MM/dd/yyyy)"
                    onInput={e => handleCreateTransactionChange(e, "date")}
                />
                <input 
                    type="text"
                    placeholder="Memo"
                    onInput={e => handleCreateTransactionChange(e, "memo")}
                />
                <input
                    type="button"
                    value="Submit"
                    onClick={async () => await handleConfirmCreateTransaction()}
                />
                <input
                    type="button"
                    value="Cancel"
                    onClick={() => handleCancelCreateTransaction()}
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