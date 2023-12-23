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
    member: string[];
  }[]
}

const DashBoard = ({ data, groupData }: Props) => {
  const [newGroup, setNewGroup] = useState<{ id: string, name: string }[]>([])
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
        member: []
      })
      ref.current.value = "";
    }
  }

  const handleJoinGroup = async(id: string) => {
    const targetGroup = groupData.find((group) => group.groupId === id);
    if (targetGroup) {
      //既に同じユーザーが存在しているときは新しく追加しない
      //退室時に削除するので同じユーザーは存在しないようにする
      if (!targetGroup.member.includes(data.id)) {
        const newMembers = [...targetGroup.member, data.id];
        console.log(newMembers)
        const groupDocRef = doc(db, "groups", id);
        await updateDoc(groupDocRef, { member: newMembers });
      } else {
        console.log("ユーザーは既にグループに参加しています。");
      }
    } else{
      console.log("対応するグループが見つかりません。");
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