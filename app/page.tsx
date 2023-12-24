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
  const [user, setUser] = useState<{ displayName: string, id: string }>({ displayName: "", id: "" })
  const [group, setGroup] = useState<{ 
    groupId: string, 
    groupName: string,
    status: string
  }[]>([]);

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
        return { 
          groupId: groupData.groupId, 
          groupName: groupData.groupName,
          status: groupData.status
        }
      })
      setGroup(group)
    })
  }, [])


  return (
    <>
    { isSignedIn ? (
      <div className="relative max-w-[1920px] w-full min-h-screen">
        <DashBoard data={ user } groupData={ group } />
      </div>
    ) : (
      <Login />
    )}
    </>
  )
}
