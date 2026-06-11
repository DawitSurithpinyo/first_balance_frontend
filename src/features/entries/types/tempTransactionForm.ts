export interface TempTransactionForm {
    transactionName: string;
    accountID: string;
    value: string;
    date: string;
    memo?: string | null | undefined;
}

export const tempTransactionFormDefault: TempTransactionForm = {
    transactionName: '',
    accountID: '',
    value: '',
    date: '',
    memo: null
}