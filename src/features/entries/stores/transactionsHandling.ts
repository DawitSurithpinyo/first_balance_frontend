import { create } from "zustand";
import { type TransactionsSortKeys } from "@/types/transactions";

interface transactionHandling {
    sortKey: TransactionsSortKeys
    sortAscending: boolean
    selectingTIDs: string[] // currently selected transactions by their ID
    setSortKey: (key: TransactionsSortKeys) => void
    setSortAsc: (asc: boolean) => void
    addSelectingTIDs: (TIDs: string) => void
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
    addSelectingTIDs: TID =>
        set((state) => ({
            selectingTIDs: [
                TID,
                ...state.selectingTIDs
            ]
        }))
}))