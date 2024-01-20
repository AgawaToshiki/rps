import React, { useEffect } from 'react';
import { auth } from "../../firebase";
import { onAuthStateChanged } from 'firebase/auth';



const ProtectRoute = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if(!user){
        window.location.href = "/";
      }
    });
  }, [])
  
  return children
}

export default ProtectRoute