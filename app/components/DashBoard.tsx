import React, { useRef, useState } from 'react'
import GroupList from './GroupList'
import Group from './Group'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from "../../firebase";

type Props = {
  data: {
    displayName: string;
    id: string;
  },
  groupData: {
    groupName: string;
    groupId: string;
    status: string;
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
        status: "waiting"
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
      await addDoc(memberCollectionRef, {
        userId: data.id,
        displayName: data.displayName,
        choice: ""
      })
    } else {
      console.log("ユーザーは既に存在します。")
    }
  }

  return (
    <div>
      <p className="my-10">ようこそ{ data.displayName }さん</p>
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
      <input 
        type="text" 
        ref={ ref } 
        className="border-2 border-black p-2" 
      />
      <button onClick={ handleNewGroup } className="border-2 border-black p-2">新規グループを作成</button>
    </div>
  )
}

export default DashBoard