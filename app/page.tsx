'use client'
import Image from 'next/image';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";



export default function Home() {
  const [isName, setName] = useState<string>("")
  const [isUser, setUser] = useState<string>("")
  
  const signIn = () => {
    const auth = getAuth(app);
    signInAnonymously(auth)
      .then(() => {
        console.log("login success")
        // Signed in..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode)
        console.log(errorMessage)
        // ...
      });
  }

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    console.log(uid)
    setUser(uid)
    // ...
  } else {
    // User is signed out
    // ...
  }
});


  return (
    <div className="flex justify-center items-center min-h-screen">
        <input type="text" value={ isName } onChange={(e)=> setName(e.target.value)} placeholder="user名" className="border-2 border-black p-2"/>
        <button type="submit" onClick={signIn} className="border-2 border-black p-2">登録</button>
            {isUser}
    </div>
  )
}
