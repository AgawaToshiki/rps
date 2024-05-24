import React from 'react'
import Image from 'next/image';

const Group = ({ groupName, password }: { groupName: string, password: string | null }) => {
  return (
    <div className="px-2 py-10 bg-red-200 shadow-card text-center font-bold text-lg line-clamp-1 max-md:text-base max-sm:text-sm max-md:px-0 relative top-0 transition-all duration-100 ease-out hover:-top-[3px] active:top-0 active:shadow-none">
      <div className="absolute top-[5%] right-[5%]">
        { password 
        ? (
          <div>
            <Image 
              src="/images/lock.png"
              alt=""
              width={50}
              height={50}
              priority={false}
              className="w-[40px] h-auto max-md:w-[30px]"
            />
          </div>
          ) 
        : (
          <div></div>
          )
        }
      </div>
      { groupName }
    </div>
  )
}

export default Group