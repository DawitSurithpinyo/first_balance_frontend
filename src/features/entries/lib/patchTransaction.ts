import { api } from "@/lib/api";
import type { Transaction } from "@/types/transactions";

export default async function patchTransaction(
    body: Partial<Transaction>,
    csrfToken: string,
): Promise<void> {
    const result = await api.patch('transaction/update', csrfToken, undefined, body)
    if (result.type == "api_error" || 
        result.type == "validation_error" ||
        result.type == "unknown_error"
    ) {
        throw result.error
    }
}