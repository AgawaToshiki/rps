import React, { useRef, useState } from 'react'
import GroupList from './GroupList'
import Group from './Group'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from "../../firebase";
import SignOut from './SignOut';

type Props = {
  data: {
    displayName: string;
    id: string;
  },
  groupData: {
    groupName: string;
    groupId: string;
  }[],
}

const DashBoard = ({ data, groupData }: Props) => {
  const [newGroup, setNewGroup] = useState<{ id: string, name: string }[]>([])
  const ref = useRef<HTMLInputElement>(null);
  
  const handleNewGroup = async() => {
    if(ref.current && auth.currentUser){
      if(ref.current.value !== "" && ref.current.value.length < 13){
        const groupId = uuidv4();
        setNewGroup([...newGroup, { id: groupId, name: ref.current.value }]);
        await setDoc(doc(db, "groups", groupId), {
          groupId: groupId,
          groupName: ref.current.value,
          status: "waiting",
          winnerHand: "no Hand",
          userId: auth.currentUser.uid
        })
        ref.current.value = "";
      } else {
        alert("グループ名は12文字以下で必須です")
      }
    }
  }

  const handleJoinGroup = async(id: string) => {
    const memberCollectionRef = collection(db, "groups", id, "members");
    const groupQuerySnapshot = await getDocs(
      query(memberCollectionRef, where("userId", "==", data.id))
    );
    if(groupQuerySnapshot.size === 0) {
      const memberDocRef = doc(memberCollectionRef, data.id)
      await setDoc(memberDocRef, {
        userId: data.id,
        displayName: data.displayName,
        choice: ""
      })
    } else {
      console.log("ユーザーは既に存在します")
    }
  }

  return (
    <div className="flex flex-col max-w-[1920px] w-[90%] mx-auto max-sm:w-[95%]">
      <p className="flex justify-center w-full my-10 text-2xl">ようこそ{ data.displayName }さん</p>
      <div className="flex gap-[1px] my-10 max-md:flex-col max-md:gap-[10px]">
          <input 
            type="text" 
            ref={ ref } 
            className="border-2 border-font-color p-2" 
          />
          <button onClick={ handleNewGroup } className="border-2 border-font-color p-2">新規グループ作成</button>
      </div>
      <div>
        <p className="text-xl border-b-2 pb-2">グループ一覧</p>
      </div>
      <GroupList>
        <div className="grid grid-cols-4 my-10 max-lg:grid-cols-3 max-sm:grid-cols-2 gap-2">
          {groupData.map((group) => {
            return (
              <Link
                onClick={ () => { handleJoinGroup(group.groupId) } }
                href={{ 
                  pathname: `/group`, 
                  query: {
                    id: `${group.groupId}`
                  }
                }}
                key={ group.groupId }>
                  <Group groupName={ group.groupName }/>
              </Link>
            )
          })}
        </div>
      </GroupList>
      <div className="flex justify-start">
        <SignOut />
      </div>
    </div>
  )
}

export default DashBoard