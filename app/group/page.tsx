"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const page = () => {
  const nextQuery = useSearchParams()
  const params = { 
      id: nextQuery.get('id'), 
  }
  const [isGroup, setGroup] = useState<{ 
    groupId: string, 
    groupName: string, 
    member: {
      userId: string, 
      displayName: string 
    }[] 
  }[]>([]);

  //グループメンバー取得
  useEffect(() => {
    if(params.id){
      const getGroup = query(collection(db, "groups"), where("groupId", "==", params.id))
      onSnapshot(getGroup, (querySnapshot) => {
        const group = querySnapshot.docs.map((doc) => {
          const groupData = doc.data()
          return { groupId: groupData.groupId, groupName: groupData.groupName, member: groupData.member }
        })
        setGroup(group)
      })
    }
    if(auth.currentUser){
      const currentUser = auth.currentUser.uid
      console.log(currentUser)
    }
  }, [])
  const handleLeaveGroup = () => {

  }

  // const handleChooseHand = (choice) => {
  //   if(auth.currentUser){
  //     const currentUser = auth.currentUser.uid
  //     const userDoc = query(collection(db,'users'),where("userId", "==", currentUser));
  //   }
  // }
  return (
    <div>
      <div>
        { isGroup.map((group) => (
          <div key={ group.groupId } className="flex flex-col border border-black">
            {group.member.map((member,index) => (
              <div key={ index } className="bg-pink-200 border border-black">{ member.displayName }</div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex">
        {/* <button onClick={() => handleChooseHand('rock')} className="border border-black">グー</button>
        <button onClick={() => handleChooseHand('scissors')} className="border border-black">チョキ</button>
        <button onClick={() => handleChooseHand('paper')} className="border border-black">パー</button> */}
      </div>
      <Link href="/" onClick={() => { handleLeaveGroup }}>退出</Link>
    </div>
  )
}

export default page