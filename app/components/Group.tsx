import React from 'react'

const Group = ({ groupName }: { groupName: string }) => {
  return (
    <div className="px-2 py-10 bg-pink-200 border text-center font-bold text-xl max-lg:text-lg max-md:text-base max-sm:text-sm max-md:px-0">{ groupName }</div>
  )
}

export default Group