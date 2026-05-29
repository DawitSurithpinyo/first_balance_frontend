import { create } from 'zustand';
import { type Transaction } from '@/types/transactions';
import { type TransactionsEditableFields } from '@/types/transactions';

interface TransactionsState {
    transactions: Transaction[]
    needRefetch: boolean
    addOneTransaction: (t: Transaction) => void // for adding a new transaction in entry page
    loadTransactions: (t: Transaction[]) => void // for loading user's transactions from API
    updateOneTransaction: <K extends TransactionsEditableFields>(
        TID: string, 
        field: K, 
        newVal: Transaction[K]
    ) => void
    removeOneTransaction: (TID: string) => void
    removeManyTransactions: (TIDs: string[]) => void
    removeAllTransactions: () => void
    setNeedRefetch: (b: boolean) => void
}

export const useTransactions = create<TransactionsState>((set) => ({
    transactions: [],
    needRefetch: true,
    addOneTransaction: t => 
        set(state => ({
            transactions: [
                {
                    transactionID: t.transactionID,
                    transactionName: t.transactionName,
                    accountID: t.accountID,
                    value: t.value,
                    date: t.date,
                    memo: t.memo
                },
                ...state.transactions
            ]
        })),
    updateOneTransaction: (TID, field, newVal) =>
        set(state => ({
            transactions: state.transactions.map((transaction) => 
                transaction.transactionID === TID
                ? {
                    ...transaction,
                    [field]: newVal
                  }
                : transaction
            )
        })),
    loadTransactions: t => 
        set(() => ({
            transactions: [
                ...t
            ]
        })),
    setNeedRefetch: b => 
        set(() => ({
            needRefetch: b
        })),
    removeOneTransaction: TID =>
        set((state) => ({
            transactions: state.transactions.filter((t) =>
                t.transactionID !== TID
            )
        })),
    removeManyTransactions: TIDs =>
        set((state) => ({
            transactions: state.transactions.filter((t) =>
                !TIDs.includes(t.transactionID)
            )
        })),
    removeAllTransactions: () => 
        set(() => ({
            transactions: []
        }))
}))