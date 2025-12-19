import '@/App.css'
import { api, ApiError } from '@/lib/api';
import { useAuthContext } from '@/stores/authContext';
import * as z from 'zod';
import { Routes, Route, Navigate, Outlet, redirect } from 'react-router';
import { userTypes, type GoogleUser, type NormalUser } from '@/features/login/types/userAuth';
import { getCredentialsMsgObj } from '@/features/login/types/authErrToMsg';
import { displayResponseMsg } from '@/utils/displayResponseMsg';
import { useEffect } from 'react';

import Dashboard from '@/features/dashboard/components/dashboard'
import Entries from '@/features/entries/components/entries';
import Login from '@/features/login/components/login';
import NotFound from '@/features/notFound/components/notFound';
import Setting from '@/features/setting/components/setting';


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
        redirect("/dashboard");
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
      <Routes>
        <Route index element={<Login/>} />
        <Route element={<ProtectedRoute credentials={credentials}/> } />
          <Route path='dashboard' element={<Dashboard/>} />
          <Route path='entries' element={<Entries/>} />
          <Route path='setting' element={<Setting/>} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </>
  )
}

export default App
