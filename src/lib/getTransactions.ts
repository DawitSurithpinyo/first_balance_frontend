import { api } from "./api";
import { transactionsArray, type Transaction } from "@/types/transactions";

export default async function getTransactions(
    setStateCallback: (t: Transaction[]) => void
): Promise<void> {
    try {
        const res = await api.get('transaction/get', {})
        if (res.type == 'api_error') {
            console.log(res.error.message)
            return
        }
        else if (res.type == 'validation_error') {
            console.log(`Malformed API response. Details: \n ${res.error}`)
            return
        }
        else if (res.type == 'unknown_error') {
            console.log(`Unknown error occured: ${res.error}`)
            return
        }
        
        if (res.data.messageCode == "SUCCESS_FETCHED") {
            const parsed = transactionsArray.safeParse(res.data.data)
            if (!parsed.success) {
                console.log(`Malformed API response. Details: \n ${parsed.error}`)
                return
            }
            setStateCallback(parsed.data)
            return
        }
        else if (res.data.messageCode == "SUCCESS_NO_REFETCH_NEEDED") {
            return
        }
    }
    catch (error) {
        console.log(error)
    }
}