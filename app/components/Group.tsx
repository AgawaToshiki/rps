import React from 'react'

const Group = ({ groupName }: { groupName: string }) => {
  return (
    <div className="p-10 bg-pink-400 border text-center font-bold">{ groupName }</div>
  )
}

export default Group