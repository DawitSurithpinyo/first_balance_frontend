import z from 'zod'

export const transaction = z.object({
    transactionID: z.string().max(30),
    transactionName: z.string().max(500),
    accountID: z.string().max(500),
    value: z.number(),
    date: z.coerce.date(),
    memo: z.string().max(500).optional().nullable()
})

export const transactionsArray = z.array(transaction)

export type Transaction = z.infer<typeof transaction>

export type TransactionsSortKeys = Exclude<keyof Transaction, "transactionID">
export type TransactionsEditableFields = TransactionsSortKeys