import { useTransactionsHandling } from "@/features/entries/stores/transactionsHandling"
import deleteManyTransactions from "@/features/entries/lib/deleteManyTransactions"

import { useTransactions } from "@/stores/transactionsStore"
import { useAuthContext } from "@/stores/authContext"
import type { TransactionsSortKeys } from "@/types/transactions"

export default function Toolbar() {
    const { csrfToken } = useAuthContext()

    const transactions = useTransactions((state) => state.transactions)
    const setSortKey = useTransactionsHandling((state) => state.setSortKey)
    const setSortAsc = useTransactionsHandling((state) => state.setSortAsc)
    const setTransactionsNeedRefetch = useTransactions((state) => state.setNeedRefetch)
    const removeManyTransactions = useTransactions((state) => state.removeManyTransactions)
    const removeAllTransactions = useTransactions((state) => state.removeAllTransactions)

    const creatingIsEnabled = useTransactionsHandling((s) => s.creatingIsEnabled)
    const setCreatingIsEnabled = useTransactionsHandling((s) => s.setCreatingIsEnabled)

    const selectingTIDs = useTransactionsHandling((state) => state.selectingTIDs)
    const addManySelectingTIDs = useTransactionsHandling((state) => state.addManySelectingTIDs)
    const removeManySelectingTID = useTransactionsHandling((state) => state.removeManySelectingTIDs)
    const removeAllSelectingTIDs = useTransactionsHandling((state) => state.removeAllSelectingTIDs)

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


    // display functions
    function displaySelectOptions(): React.ReactNode {
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
        if (selectingTIDs.length == 0) {
            return undefined
        }
        return (
            <input 
                type="submit"
                value="Delete all selected"
                onClick={async () => await handleDeleteManyOrAll()}
            />         
        )
    }

    function displayCreateButton(): React.ReactNode {
        return (
            <input 
                type="button" 
                value="Create a new entry"
                disabled={creatingIsEnabled}
                onClick={() => setCreatingIsEnabled(true)}
            />
        )
    }


    if (transactions.length === 0) {
        return (
            <>
                {displayCreateButton()}
            </>
        )
    }

    return (
        <>
            {/* sorting */}
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

            {/* select, deselect, delete */}
            {displaySelectOptions()}
            {displayDeleteEntriesButton()}

            {/* create */}
            {displayCreateButton()}
        </>
    )
}