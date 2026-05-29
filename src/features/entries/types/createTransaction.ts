import z from "zod";

export interface CreateTransactionBody {
    transactionName: string;
    accountID: string;
    value: number;
    date: Date;
    memo?: string | null | undefined;
}

export const createTransactionResponse = z.object({
    insertedID: z.string().max(30)
})

export type CreateTransactionResponse = z.infer<typeof createTransactionResponse>