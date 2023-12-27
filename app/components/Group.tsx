import React from 'react'

const Group = ({ groupName }: { groupName: string }) => {
  return (
    <div className="px-2 py-10 bg-card-color shadow-lg border text-center font-bold text-xl max-lg:text-lg max-md:text-base max-sm:text-sm max-md:px-0 relative top-0 transition-all duration-100 ease-out hover:-top-[3px] active:top-0 active:shadow-md">
      { groupName }
    </div>
  )
}

export default Group