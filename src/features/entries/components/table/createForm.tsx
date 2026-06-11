import createTransaction from "@/features/entries/lib/createOneTransaction"
import { type TempTransactionForm, tempTransactionFormDefault } from "@/features/entries/types/tempTransactionForm"
import type { CreateTransactionBody, CreateTransactionResponse } from "@/features/entries/types/createTransaction"
import { validateString, 
    validateDateString, 
    validateOptionalString, 
    parseStringToDate, 
    parseStringToNumber 
} from "@/features/entries/utils/validateInputs"
import { useTransactionsHandling } from "@/features/entries/stores/transactionsHandling"

import type { TransactionsEditableFields, Transaction } from "@/types/transactions"
import { useTransactions } from "@/stores/transactionsStore"
import { useAuthContext } from "@/stores/authContext"

import { useState } from "react"
import { isEqual } from "lodash"

export default function CreateForm() {
    const { csrfToken } = useAuthContext()

    const setTransactionsNeedRefetch = useTransactions((state) => state.setNeedRefetch)
    const addOneTransaction = useTransactions((state) => state.addOneTransaction)

    // create button and form
    const creatingIsEnabled = useTransactionsHandling((s) => s.creatingIsEnabled)
    const setCreatingIsEnabled = useTransactionsHandling((s) => s.setCreatingIsEnabled)
    const [creatingTransaction, setCreatingTransaction] = useState<TempTransactionForm>(tempTransactionFormDefault)

    function handleCreateTransactionChange(
        val: string,
        field: TransactionsEditableFields
    ): void {
        setCreatingTransaction(t => ({...t, [field]: val}))
    }

    function handleCancelOrFinishCreateTransaction(): void {
        setCreatingIsEnabled(false)
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

    if (!creatingIsEnabled) {
        return undefined
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