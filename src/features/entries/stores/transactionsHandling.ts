import { create } from "zustand";
import { type TransactionsSortKeys } from "@/types/transactions";

interface transactionHandling {
    sortKey: TransactionsSortKeys
    sortAscending: boolean
    selectingTIDs: string[] // currently selected transactions by their ID
    setSortKey: (key: TransactionsSortKeys) => void
    setSortAsc: (asc: boolean) => void
    addOneSelectingTID: (TID: string) => void
    addManySelectingTIDs: (TIDs: string[]) => void
    removeOneSelectingTID: (TID: string) => void
    removeManySelectingTIDs: (TIDs: string[]) => void
    removeAllSelectingTIDs: () => void
}

export const useTransactionsHandling = create<transactionHandling>((set) => ({
    sortKey: "date",
    sortAscending: true,
    selectingTIDs: [],
    setSortKey: key => 
        set(() => ({
            sortKey: key
        })),
    setSortAsc: asc =>
        set(() => ({
            sortAscending: asc
        })),
    addOneSelectingTID: TID =>
        set((state) => ({
            selectingTIDs: [
                TID,
                ...state.selectingTIDs
            ]
        })),
    addManySelectingTIDs: TIDs =>
        set((state) => ({
            selectingTIDs: [
                ...TIDs,
                ...state.selectingTIDs
            ]
        })),
    removeOneSelectingTID: targetTID =>
        set((state) => ({
            selectingTIDs: state.selectingTIDs.filter((tid) =>
                tid !== targetTID
            )
        })),
    removeManySelectingTIDs: TIDs => 
        set((state) => ({
            selectingTIDs: state.selectingTIDs.filter((tid) => 
                !TIDs.includes(tid)
            )
        })),
    removeAllSelectingTIDs: () => 
        set(() => ({
            selectingTIDs: []
        }))
}))