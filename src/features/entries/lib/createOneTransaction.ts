import { api } from "@/lib/api";
import { type CreateTransactionBody,
    createTransactionResponse,
    type CreateTransactionResponse
} from "@/features/entries/types/createTransaction";

export default async function createTransaction(
    body: CreateTransactionBody,
    csrfToken: string
): Promise<CreateTransactionResponse> {
    const result = await api.post('transaction/add', csrfToken, undefined, body)
    if (result.type == "api_error" || 
        result.type == "validation_error" ||
        result.type == "unknown_error"
    ) {
        throw result.error
    }

    const parsed = createTransactionResponse.safeParse(result.data.data)
    if (!parsed.success) {
        throw new Error(`Malformed API response. Details: \n ${parsed.error}`)
    }
    return parsed.data
}