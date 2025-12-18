import { baseMsgCodeToMsg } from "@/types/baseMsgCodeToMsg";

export type getCredentialsMsg = baseMsgCodeToMsg & {
    "SUCCESS_NEW_PRELOGIN_SESSION": "No user session found. Please create an account, login, or use guest mode."
    "SUCCESS_EXISTING_PRELOGIN_SESSION": "No user session found. Please create an account, login, or use guest mode."
    "SUCCESS_EXISTING_POSTLOGIN_SESSION": "User session found. Redirecting..."

    "ERROR_RATE_LIMIT_EXCEEDED": "Please try again a few seconds later."
    "ERROR_INVALID_DB_RESULT_FOR_POSTLOGIN": "Sorry, there was an internal error. Please try again."
    "ERROR_MALFORMED_SERVER_SESSION": "Sorry, there was an internal error. Please try again."
}

export const getCredentialsMsgObj: getCredentialsMsg;