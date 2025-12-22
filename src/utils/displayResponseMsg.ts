import type { ApiError } from "@/lib/api";
import type { ApiResponse } from "@/types/apiResponseBase";


export function displayResponseMsg(errToMsgObj: object, response: ApiResponse | ApiError): void {
    type key = keyof typeof errToMsgObj;
    const msg = errToMsgObj[response.messageCode as key];
    console.log(msg);
}