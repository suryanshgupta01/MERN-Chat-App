import { Spinner } from '@chakra-ui/react'
import { CircularProgress } from '@mui/material'
import React from 'react'

const Loading = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw"
      // backgroundColor:'green'
    }}>
      <Spinner

        thickness='4px'
        speed='0.75s'
        emptyColor='gray.200'
        color='green.600'
        size='xl'
      />
    </div>
  )
}

export default Loading
