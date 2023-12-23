'use client'
import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import DashBoard from './components/DashBoard';
import SignOut from './components/SignOut';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, where } from 'firebase/firestore';



export default function Home() {
  const [isSignedIn, setSignedIn] = useState<boolean>(false)
  const [isUser, setUser] = useState<{ displayName: string, id: string }>({ displayName: "", id: "" })
  const [isGroup, setGroup] = useState<{ groupId: string; groupName: string; }[]>([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setSignedIn(!!user)
      if(user){
        //ユーザー情報取得
        const getUser = query(collection(db, "users"), where("userId", "==", user.uid))
        onSnapshot(getUser, (querySnapshot) => {
          querySnapshot.docs.forEach((doc) => {
            const data = doc.data()
            setUser({ displayName: data.displayName, id: data.userId })
          })
        })
      }
    });

    //グループ情報取得
    const getGroup = query(collection(db, "groups"))
    onSnapshot(getGroup, (querySnapshot) => {
      const group = querySnapshot.docs.map((doc) => {
        const groupData = doc.data()
        return { groupId: groupData.groupId, groupName: groupData.groupName }
      })
      setGroup(group)
    })
  }, [])


  return (
    <>
    { isSignedIn ? (
      <>
        <DashBoard data={ isUser } groupData={ isGroup } />
        <SignOut />
      </>
    ) : (
      <Login />
    )}
    </>
  )
}
