import React, { useEffect, useState } from 'react'
import GroupList from './GroupList'
import next from 'next'
import Group from './Group'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid';

const DashBoard = ({ data }: { data: string }) => {
  const [isGroupName, setGroupName] = useState<string>("")
  const [isGroup, setGroup] = useState<{ id: string, name: string }[]>([])

  useEffect(() => {
    console.log(isGroup)
  }, [isGroup])
  const handleNewGroup = () => {
    const groupId = uuidv4();
    setGroup([...isGroup, { id: groupId, name: isGroupName }]);
  }
  return (
    <div>
      ようこそ{ data }
      <GroupList>
        {isGroup.map((group) => {
          return <Link 
            href={`/group/${group.id}`}
            key={ group.id }>
              <Group groupName={ group.name }/>
            </Link>
        })}
      </GroupList>
      <input type="text" onChange={(e) => setGroupName(e.target.value)} className="border-2 border-black p-2" />
      <button onClick={ handleNewGroup } className="border-2 border-black p-2">新規グループを作成</button>
    </div>
  )
}

export default DashBoard