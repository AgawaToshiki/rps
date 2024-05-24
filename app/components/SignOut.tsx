import React, { useState } from 'react';
import { deleteUser } from 'firebase/auth';
import { auth, db } from "../../firebase";
import { deleteDoc, doc } from 'firebase/firestore';



const SignOut = () => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const signOutUser = async() => {
    setLoading(true);
    try{
      const user = auth.currentUser
      if(user){
        await deleteDoc((doc(db, "users", user.uid)));
        await deleteUser(user);
      }
    }catch(error) {
      console.error(error);
    }finally {
      setLoading(false);
    }
  }

  
  return (
    <button onClick={ signOutUser } disabled={ isLoading } className="border-2 border-font-color p-2 bg-red-300">ログアウト</button>
  )
}

export default SignOut