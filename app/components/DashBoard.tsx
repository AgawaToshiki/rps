import React, { useRef, useState } from 'react'
import GroupList from './GroupList'
import Group from './Group'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from "../../firebase";
import SignOut from './SignOut';

type Props = {
  data: {
    displayName: string;
    id: string;
  },
  groupData: {
    groupName: string;
    groupId: string;
    status: string;
    winnerHand: string;
  }[],
}

const DashBoard = ({ data, groupData }: Props) => {
  const [newGroup, setNewGroup] = useState<{ id: string, name: string }[]>([])
  const ref = useRef<HTMLInputElement>(null);
  
  const handleNewGroup = async() => {
    if(ref.current){
      const groupId = uuidv4();
      setNewGroup([...newGroup, { id: groupId, name: ref.current.value }]);
      await setDoc(doc(db, "groups", groupId), {
        groupId: groupId,
        groupName: ref.current.value,
        status: "waiting",
        winnerHand: "no Hand"
      })
      ref.current.value = "";
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
      console.log("ユーザーは既に存在します。")
    }
  }

  return (
    <div className="">
      <p className="flex justify-center max-w-[1920px] w-full py-10 text-lg">ようこそ{ data.displayName }さん</p>
      <GroupList>
        <div className="grid grid-cols-4 max-md:grid-cols-3">
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
      <div className="flex justify-between max-w-[1920px] w-[50%] p-10 absolute bottom-0">
        <SignOut />
        <div className="flex gap-[1px]">
          <input 
            type="text" 
            ref={ ref } 
            className="border-2 border-font-color p-2" 
          />
          <button onClick={ handleNewGroup } className="border-2 border-font-color p-2">新規グループ作成</button>
        </div>
      </div>
    </div>
  )
}

export default DashBoard