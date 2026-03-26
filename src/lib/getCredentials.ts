import { api } from '@/lib/api';
import { getCredentialsMsgObj } from '@/features/login/types/authErrToMsg';
import { displayResponseMsg } from '@/utils/displayResponseMsg';
import { userTypes, type GoogleUser, type NormalUser } from '@/features/login/types/userAuth';

export default async function getCredentials(
    setCSRFToken: (token: string) => void,
    login: (cred: GoogleUser | NormalUser) => void,
    setSessionIsChecked: (checked: boolean) => void
): Promise<void> {
    try {
      const response = await api.get('auth/getCredentials', {}, setCSRFToken);
      if (response.type == "validation_error"){
        console.log(`Malformed API response. Details: \n ${response.error}`);
        return;
      }
      else if (response.type == "api_error") {
        displayResponseMsg(getCredentialsMsgObj, response.error);
        return;
      }
      else if (response.type == "unknown_error"){
        console.log(`Unknown error occured: ${response.error}`);
        return;
      }

      displayResponseMsg(getCredentialsMsgObj, response.data);
      const credentialParse = userTypes.safeParse(response.data.data);
      if (credentialParse.success) {
        login(credentialParse.data);
      }
      setSessionIsChecked(true);
    }
    catch (error) {
      console.log(error);
    }
}