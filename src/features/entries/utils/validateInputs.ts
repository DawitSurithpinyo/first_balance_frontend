// import { isValidDate } from "@/utils/sortTransactions"
import { parse, isValid } from "date-fns"

export function validateString(input: any): string {
    if (typeof input != "string") {
        throw new Error("Input is not a string.")
    }
    if (input.length == 0 || input.length > 500) {
        throw new Error("Input is empty or longer than 500 characters.")
    }
    return input
}

export function parseStringToNumber(input: any): number {
    if (typeof input != "string") {
        throw new Error("Input is not a string.")
    }
    const t = Number(input)
    if (isNaN(t)) {
        throw new Error("Input is not a number.")
    }
    return t
}

export type DateFormats = "MM/dd/yyyy" // possibly add more in the future, or move picking date format to Zustand
export function validateDateString(
    input: any,
    expectedFormat: DateFormats
): string {
    if (typeof input != "string") {
        throw new Error("Input is not a string.")
    }
    const parsed = parse(input, expectedFormat, new Date())
    if (!isValid(parsed)) {
        throw new Error(`Input is not a valid date-like string, or not following the ${expectedFormat} format.`)
    }
    return input
}

export function parseStringToDate(input: any): Date {
    if (typeof input != "string") {
        throw new Error("Input is not a string.")
    }
    const d = new Date(input)
    if (isNaN(d.getTime())) {
        throw new Error("Input is not a valid date-like string.")
    }
    return d
}

export function validateOptionalString(input: any): string {
    if (typeof input != "string") {
        throw new Error("Input is not a string.")
    }
    if (input.length > 500) {
        throw new Error("Input is longer than 500 characters.")
    }
    return input   
}