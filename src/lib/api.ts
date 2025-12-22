import { apiResponse, type ApiResponse } from "@/types/apiResponseBase";
import { csrfTokenObj } from "@/features/login/types/userAuth";
import * as z from "zod";


const API_BASE_URL = import.meta.env.VITE_API_URL;
const defaultHeaders = {
    'Content-Type': 'application/json'
};
const defaultOptions: RequestInit = {
    credentials: 'include'
}

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
    options: RequestInit = {},
    csrfToken?: string,
    setCSRFTokenFunc?: (token: string) => void
): Promise<ApiResponse | z.ZodError | Error>{
    const url = `${API_BASE_URL}${endpoint}`;

    let csrfHeader = {};
    const method = options.method;
    if (!method) {
        throw new Error('Method must be specified in a request');
    }
    if(!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
        csrfHeader = {
            'X-CSRF-Token': csrfToken
        };
    }
    const reqOptions: RequestInit = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
            ...csrfHeader,
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

        const csrfTok = response.headers.get('X-CSRF-Token');
        if(setCSRFTokenFunc){
            const tokenParsed = csrfTokenObj.parse(csrfTok);
            setCSRFTokenFunc(tokenParsed);
        }

        return parsed;
    }
    catch (error) {
        return error instanceof Error || error instanceof z.ZodError || error instanceof ApiError
         ? error 
         : Error(`An unknown error occured: ${error}`)
    }
}

export const api = {
    get: (endpoint: string, 
        options?: RequestInit, 
        setCSRFTokenFunc?: (token: string) => void): 
        Promise<ApiResponse | z.ZodError | Error> => 
            request(endpoint, {
                ...options, 
                method: 'GET'
            }, undefined, setCSRFTokenFunc),
    
    post: (
        endpoint: string,
        csrfToken: string,
        setCSRFTokenFunc?: (token: string) => void, 
        data?: unknown,
        options?: RequestInit,
    ): Promise<ApiResponse | z.ZodError | Error> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'POST',
        }, 
        csrfToken, setCSRFTokenFunc),

    put: (
        endpoint: string, 
        csrfToken: string,
        setCSRFTokenFunc?: (token: string) => void, 
        data?: unknown,
        options?: RequestInit
    ): Promise<ApiResponse | z.ZodError | Error> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'PUT',
        },
        csrfToken, setCSRFTokenFunc),

    patch: (
        endpoint: string, 
        csrfToken: string,
        setCSRFTokenFunc: (token: string) => void, 
        data?: unknown,
        options?: RequestInit
    ): Promise<ApiResponse | z.ZodError | Error> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'PATCH',
        },
        csrfToken, setCSRFTokenFunc),

    delete: (
        endpoint: string, 
        csrfToken: string,
        setCSRFTokenFunc: (token: string) => void, 
        data?: unknown,
        options?: RequestInit
    ): Promise<ApiResponse | z.ZodError | Error> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'DELETE',
        },
        csrfToken, setCSRFTokenFunc),
}