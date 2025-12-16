import { apiResponse, type ApiResponse } from "@/types/apiResponseBase"
import * as z from "zod";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const defaultHeaders = {
    'Content-Type': 'application/json'
};

export class ApiError extends Error {
    public messageCode;
    public status;

    constructor(
        message: string,
        messageCode: string,
        status: number,
    ) {
        super(message);
        this.name = "ApiError";
        this.messageCode = messageCode;
        this.status = status;
    }
}

export async function request(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse | z.core.$ZodIssue[] | Error>{
    const url = `${API_BASE_URL}${endpoint}`;
    const {headers, ...otherOptions} = options;
    const reqOptions: RequestInit = {
        ...otherOptions,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        }
    };

    try {
        const response = await fetch(url, reqOptions);
        const data = await response.json();

        const parsed = apiResponse.parse(data);
        if (!parsed.success) {
            // Known errors from back end
            throw new ApiError(data.message, data.messageCode, response.status);
        }

        return parsed;
    }
    catch (error) {
        if(error instanceof z.ZodError){
            return error.issues;
        }
        return error instanceof Error || error instanceof ApiError
         ? error 
         : Error("An unknown error occured")
    }
}

export const api = {
    get: (endpoint: string, options?: RequestInit): 
        Promise<ApiResponse | z.core.$ZodIssue[] | Error> => 
            request(endpoint, {...options, method: 'GET'}),
    
    post: (
        endpoint: string, 
        data?: any,
        options?: RequestInit
    ): Promise<ApiResponse | z.core.$ZodIssue[] | Error> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'POST'
        }),

    put: (
        endpoint: string, 
        data?: any,
        options?: RequestInit
    ): Promise<ApiResponse | z.core.$ZodIssue[] | Error> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'PUT'
        }),

    patch: (
        endpoint: string, 
        data?: any,
        options?: RequestInit
    ): Promise<ApiResponse | z.core.$ZodIssue[] | Error> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'PATCH'
        }),

    delete: (
        endpoint: string, 
        data?: any,
        options?: RequestInit
    ): Promise<ApiResponse | z.core.$ZodIssue[] | Error> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'DELETE'
        }),
}