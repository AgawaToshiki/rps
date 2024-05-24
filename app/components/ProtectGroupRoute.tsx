import React, { useEffect, useState } from 'react';
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';



const ProtectGroupRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if(!user){
        window.location.href = "/";
      }else{
        const checkToken = async() => {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDocRef);
            if(!userSnapshot.exists() || userSnapshot.data().groupToken !== "a"){
                window.location.href = "/";
            }else{
                setLoading(false);
            }
        }
        checkToken();
      }
    });
  }, [])

  
  if(loading){
    return <div className="flex justify-center items-center min-h-screen text-2xl max-md:text-lg">Loading...</div>
  }
  
  return children
}

export default ProtectGroupRoute