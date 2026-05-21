import { create } from 'zustand';
import { type Transaction } from '@/types/transactions';

interface TransactionsState {
    transactions: Transaction[]
    addOneTransaction: (t: Transaction) => void // for adding a new transaction in entry page
    loadTransactions: (t: Transaction[]) => void // for loading user's transactions from API
}

export const useTransactions = create<TransactionsState>((set) => ({
    transactions: [],
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
    loadTransactions: t => 
        set(() => ({
            transactions: [
                ...t
            ]
        }))
}))