import React from 'react'
import GloupList from './GloupList'

const DashBoard = ({ data }: { data: string }) => {
  return (
    <div>
      ようこそ{ data }
      <GloupList>
        
      </GloupList>
    </div>
  )
}

export default DashBoard