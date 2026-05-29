import { type Transaction } from "@/types/transactions"

export function sortTransactionsByStringKey(
    arr: Transaction[],
    key: keyof Transaction,
    ascending: boolean = true
): Transaction[] {
    arr = arr.sort((a, b) => {
        // Need coalescing; 'memo' is a string field that can also be undefined or null
        const lowerA = a[key] ?? "".toLocaleLowerCase()
        const lowerB = b[key] ?? "".toLocaleLowerCase()

        if (typeof lowerA !== "string" || typeof lowerB !== "string") {
            throw new Error(`Cannot sort transactions by string field when field ${key} 
                is not of type string, or is an unrecognized field`)
        }

        if (ascending) {
            return lowerA.localeCompare(lowerB)
        }
        return lowerB.localeCompare(lowerA)   
    })

    return arr
}

export function sortTransactionsByNumericKey(
    arr: Transaction[],
    key: keyof Transaction,
    ascending: boolean = true
): Transaction[] {
    arr = arr.sort((a, b) => {
        if (typeof a[key] !== "number" || typeof b[key] !== "number") {
            throw new Error(`Cannot sort transactions by numeric field when field ${key} 
                is not of type number, or is an unrecognized field`)            
        }

        if (ascending) {
            return a[key] - b[key]
        }
        return b[key] - a[key]
    })

    return arr
}

export function sortTransactionsByDateKey(
    arr: Transaction[],
    key: keyof Transaction,
    ascending: boolean = true
): Transaction[] {
    arr = arr.sort((a, b) => {
        if (!isValidDate(a[key]) || !isValidDate(b[key])) {
            throw new Error(`Cannot sort transactions by Date field when field ${key} 
                is not of type Date, or is an unrecognized field`)            
        }

        if (ascending) {
            return a[key].getTime() - b[key].getTime()
        }
        return b[key].getTime() - a[key].getTime()
    })

    return arr
}

function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime())
}