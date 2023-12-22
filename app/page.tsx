'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import DashBoard from './components/DashBoard';
import SignOut from './components/SignOut';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, where } from 'firebase/firestore';



export default function Home() {
  const [isSignedIn, setSignedIn] = useState<boolean>(false)
  const [isUser, setUser] = useState<string>("")

    onAuthStateChanged(auth, (user) => {
      setSignedIn(!!user)
      if(user){
        const getUser = query(collection(db, "users"), where("userId", "==", user.uid))
        onSnapshot(getUser, (querySnapshot)=> {
          querySnapshot.docs.forEach((doc) => {
            const data = doc.data().displayName
            setUser(data)
          })
        })
      }
    })


  return (
    <>
    { isSignedIn ? (
      <>
        <DashBoard data={ isUser }/>
        <SignOut />
      </>
    ) : (
      <Login />
    )}
    </>
  )
}
