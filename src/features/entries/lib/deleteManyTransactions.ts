import { api } from "@/lib/api";
import { type DeleteManyTransactionsBody } from "@/features/entries/types/deleteManyTransactions";

export default async function deleteManyTransactions(
    body: DeleteManyTransactionsBody,
    csrfToken: string
): Promise<void> {
    const result = await api.delete('transaction/deleteMany', csrfToken, undefined, body)
    if (result.type == "api_error" || 
        result.type == "validation_error" ||
        result.type == "unknown_error"
    ) {
        throw result.error
    }
}