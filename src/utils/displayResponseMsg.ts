import type { ApiError } from "@/lib/api";
import type { ApiResponse } from "@/types/apiResponseBase";
import type { baseMsgCodeToMsg } from "@/types/baseMsgCodeToMsg";

export function displayResponseMsg(errToMsgObj: baseMsgCodeToMsg, response: ApiResponse | ApiError): void {
    type key = keyof typeof errToMsgObj;
    const msg = errToMsgObj[response.messageCode as key];
    console.log(msg);
}