import z from 'zod'

export const transaction = z.object({
    transactionID: z.string(),
    transactionName: z.string(),
    accountID: z.string(),
    value: z.number(),
    date: z.coerce.date(),
    memo: z.string().optional().nullable()
})

export const transactionsArray = z.array(transaction)

export type Transaction = z.infer<typeof transaction>