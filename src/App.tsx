import '@/App.css'
import { api, ApiError } from '@/lib/api';
import { useAuthContext, AuthProvider } from '@/stores/authContext';
import * as z from 'zod';
import { Routes, Route, Link, Navigate, Outlet } from 'react-router';
import { userTypes, type GoogleUser, type NormalUser } from '@/features/auth/types/userAuth';
import { getCredentialsMsgObj } from '@/features/auth/types/authErrToMsg';
import { displayResponseMsg } from '@/utils/displayResponseMsg';
import { useEffect } from 'react';


type protectedRouteProps = {
  credentials: GoogleUser | NormalUser | null;
  redirectPath?: string;
};

const ProtectedRoute = ({credentials, redirectPath = "/"}: protectedRouteProps) => {
  if(credentials === null || credentials === undefined) {
    return <Navigate to={redirectPath} replace/>;
  }
  return <Outlet/>;
};


function App() {

  const {credentials, login} = useAuthContext();

  useEffect(() => {
    getCredentials();
  }, []);

  async function getCredentials(): Promise<void> {
    try {
      const response = await api.get('/auth/getCredentials');
      if (response instanceof z.ZodError){
        console.log(`Malformed API response. Details: \n ${response.issues}`);
        return;
      }
      else if (response instanceof ApiError) {
        displayResponseMsg(getCredentialsMsgObj, response);
        return;
      }
      else if (response instanceof Error){
        console.log("Unknown error occured.");
        return;
      }

      displayResponseMsg(getCredentialsMsgObj, response);
      const credentialParse = userTypes.safeParse(response.data);
      if (credentialParse.success) {
        login(credentialParse.data);
        return;
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Can use Link for global nav bar?

  return (
    <>
      <AuthProvider>
        <Routes>
          <Route index element></Route>
          <Route element={<ProtectedRoute credentials={credentials}/> } >

          </Route>
          <Route path="*" element={<p>There's nothing here: 404!</p>} />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App
