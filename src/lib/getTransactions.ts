import { api } from "./api";
import { transactionsArray, type Transaction } from "@/types/transactions";

export default async function getTransactions(): Promise<Transaction[] | void> {
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
        
        const parsed = transactionsArray.safeParse(res.data.data)
        if (!parsed.success) {
            console.log(`Malformed API response. Details: \n ${parsed.error}`)
            return
        }
        return parsed.data
    }
    catch (error) {
        console.log(error)
    }
}