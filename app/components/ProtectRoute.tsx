import React, { useEffect, useState } from 'react';
import { auth } from "../../firebase";
import { onAuthStateChanged } from 'firebase/auth';



const ProtectRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if(!user){
        window.location.href = "/";
      }else{
        setLoading(false);
      }
    });
  }, [])

  
  if(loading){
    return <div className="flex justify-center items-center min-h-screen text-2xl max-md:text-lg">Loading...</div>
  }
  
  return children
}

export default ProtectRoute