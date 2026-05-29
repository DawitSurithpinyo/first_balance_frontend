import { api } from "@/lib/api";
import { type DeleteOneTransactionBody } from "@/features/entries/types/deleteOneTransaction";

export default async function deleteOneTransaction(
    body: DeleteOneTransactionBody,
    csrfToken: string
): Promise<void> {
    const result = await api.delete('transaction/deleteOne', csrfToken, undefined, body)
    if (result.type == "api_error" || 
        result.type == "validation_error" ||
        result.type == "unknown_error"
    ) {
        throw result.error
    }
}