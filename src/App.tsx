import '@/App.css'
import { useAuthContext } from '@/stores/authContext';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import { type GoogleUser, type NormalUser } from '@/features/login/types/userAuth';
import { useEffect } from 'react';
import getCredentials from '@/lib/getCredentials';

import Dashboard from '@/features/dashboard/components/dashboard';
import Entries from '@/features/entries/components/entries';
import Login from '@/features/login/components/login';
import NotFound from '@/features/notFound/components/notFound';
import Setting from '@/features/setting/components/setting';
import NavBar from '@/components/navBar/navBar';


type protectedRouteProps = {
  credentials: GoogleUser | NormalUser | null;
  redirectPath?: string;
};

const ProtectedRoute = ({credentials, redirectPath = "/"}: protectedRouteProps) => {
  const {sessionIsChecked} = useAuthContext();
  if (!sessionIsChecked) {
    return <div>Loading...</div>
  }

  if(!credentials) {
    return <Navigate to={redirectPath} replace/>;
  }

  return (
    <>
      {/* After auth: global navbar + everything else */}
      <NavBar/>
      <Outlet/>
    </>
  );
};


function App() {

  const {credentials, login, setCSRFToken, setSessionIsChecked} = useAuthContext();

  useEffect(() => {
    const run = async() => {
      await getCredentials(setCSRFToken, login, setSessionIsChecked);
    };
    run();
  }, []);

  return (
    <>
      <Routes>
        <Route index element={<Login/>} />
        <Route element={<ProtectedRoute credentials={credentials}/>}>
          <Route path='dashboard' element={<Dashboard/>} />
          <Route path='entries' element={<Entries/>} />
          <Route path='setting' element={<Setting/>} />
        </Route>
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </>
  )
}

export default App
