"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const page = () => {
  const nextQuery = useSearchParams()
  const params = { 
      id: nextQuery.get('id'), 
  }

  const [isMember, setMember] = useState<{
    userId: string,
    displayName: string,
    choice: string
  }[]>([])

  //グループメンバー取得
  useEffect(() => {
      if(params.id){
        const memberDocRef = query(collection(db, "groups", params.id, "members"))
        onSnapshot(memberDocRef, (querySnapshot) => {
          const membersArray: { userId: string, displayName: string, choice: string }[] = [];
          querySnapshot.docs.forEach((doc) => {
            membersArray.push({
              userId: doc.data().userId,
              displayName: doc.data().displayName,
              choice: doc.data().choice,
            })
            console.log(doc.data())
          })
          setMember(membersArray)
        })
        console.log(isMember)
      }
  }, [])
  const handleLeaveGroup = () => {

  }

  const handleChooseHand = async(choice: string) => {
    console.log(choice)
    if(params.id && auth.currentUser){
      const memberQuery = query(collection(db, "groups", params.id, "members"), where("userId", "==", auth.currentUser.uid))
      const memberQuerySnapshot = await getDocs(memberQuery);
      if(memberQuerySnapshot.size > 0) {
        const memberDoc = memberQuerySnapshot.docs[0];
        const memberDocRef = doc(db, "groups", params.id, "members", memberDoc.id);
        await updateDoc(memberDocRef, { choice });
      } else {
        console.log("メンバーが見つかりません。")
      }
    }

  }
  return (
    <div>
      <div>
        { isMember.map((member) => (
          <div key={ member.userId }>{ member.displayName }:{ member.choice }</div>
        )) }
      </div>
      <div className="flex">
        <button onClick={() => handleChooseHand('rock')} className="border border-black">グー</button>
        <button onClick={() => handleChooseHand('scissors')} className="border border-black">チョキ</button>
        <button onClick={() => handleChooseHand('paper')} className="border border-black">パー</button>
      </div>
      <Link href="/" onClick={() => { handleLeaveGroup }}>退出</Link>
    </div>
  )
}

export default page