import { apiResponse, type ApiResponse } from "@/types/apiResponseBase";
import { csrfTokenObj } from "@/features/login/types/userAuth";
import * as z from "zod";

export type ApiResult =
  | { type: "success"; data: ApiResponse }
  | { type: "api_error"; error: ApiError }
  | { type: "validation_error"; error: z.ZodError }
  | { type: "unknown_error"; error: Error };

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
): Promise<ApiResult>{
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

        return { type: "success", data: parsed };
    }
    catch (error) {
        if (error instanceof ApiError) {
            return { type: "api_error", error };
        }

        if (error instanceof z.ZodError) {
            return { type: "validation_error", error };
        }

        if (error instanceof Error) {
            return { type: "unknown_error", error };
        }

        return {
            type: "unknown_error",
            error: new Error(`An unknown error occurred: ${error}`)
        };
    }
}

export const api = {
    get: (endpoint: string, 
        options?: RequestInit, 
        setCSRFTokenFunc?: (token: string) => void): 
        Promise<ApiResult> => 
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
    ): Promise<ApiResult> => 
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
    ): Promise<ApiResult> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'PUT',
        },
        csrfToken, setCSRFTokenFunc),

    patch: (
        endpoint: string, 
        csrfToken: string,
        setCSRFTokenFunc?: (token: string) => void, 
        data?: unknown,
        options?: RequestInit
    ): Promise<ApiResult> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'PATCH',
        },
        csrfToken, setCSRFTokenFunc),

    delete: (
        endpoint: string, 
        csrfToken: string,
        setCSRFTokenFunc?: (token: string) => void, 
        data?: unknown,
        options?: RequestInit
    ): Promise<ApiResult> => 
        request(endpoint, {
            ...options, 
            body: data ? JSON.stringify(data) : undefined,
            method: 'DELETE',
        },
        csrfToken, setCSRFTokenFunc),
}