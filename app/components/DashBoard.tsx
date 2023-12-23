import React, { useEffect, useRef, useState } from 'react'
import GroupList from './GroupList'
import Group from './Group'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from "../../firebase";

type Props = {
  data: {
    displayName: string;
    id: string;
  },
  groupData: {
    groupName: string;
    groupId: string;
  }[]
}

const DashBoard = ({ data, groupData }: Props) => {
  const [newGroup, setNewGroup] = useState<{ id: string, name: string }[]>([])
  const [isMember, setMember] = useState<string>(data.id)
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(newGroup)
  }, [newGroup])
  
  const handleNewGroup = async() => {
    if(ref.current){
      const groupId = uuidv4();
      setNewGroup([...newGroup, { id: groupId, name: ref.current.value }]);
      await setDoc(doc(db, "groups", groupId), {
        groupId: groupId,
        groupName: ref.current.value,
      })
      ref.current.value = "";
    }
  }

  const handleJoinGroup = async(id: string) => {
    await updateDoc(doc(db, "groups", id), {
      member: [data.id]
    });
  }

  return (
    <div>
      ようこそ{ data.displayName }
      <GroupList>
        <div className="grid grid-cols-4">
          {groupData.map((group) => {
            return (
              <Link
                onClick={ () => { handleJoinGroup(group.groupId) } }
                href={ `/group/${group.groupId}` }
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