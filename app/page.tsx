'use client'
import React, { useEffect, useState } from 'react';
import LoginAnonymous from './components/LoginAnonymous';
import DashBoard from './components/DashBoard';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, where } from 'firebase/firestore';



export default function Home() {
  const [isSignedIn, setSignedIn] = useState<boolean>(false)
  const [user, setUser] = useState<{ displayName: string, id: string }>({ displayName: "", id: "" })
  const [group, setGroup] = useState<{ 
    groupId: string, 
    groupName: string,
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
          groupName: groupData.groupName
        }
      })
      setGroup(group)
    })
  }, [])


  return (
    <>
    { isSignedIn ? (
      <div className="max-w-[1920px] w-full">
        <DashBoard data={ user } groupData={ group } />
      </div>
    ) : (
      <LoginAnonymous />
    )}
    </>
  )
}
