import React from 'react'
import { Container, Box, Text } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Login from '../components/authentication/Login'
import Signup from '../components/authentication/Signup'

export default function Homepage() {

    return (
        <div className='megadiv'>
            <Container maxW="xl" centerContent colorScheme='green'>
                <Box
                    d="flex"
                    justifyContent='center'
                    alignItems='center'
                    p={3}
                    bg={'white'}
                    w="100%"
                    m="20px 0 15px 0"
                    borderRadius="lg"
                    boxShadow="lg"
                    borderWidth="1px"
                >
                    <Text fontSize="4xl" textAlign='center'>MERN CHAT APP</Text>
                    <Tabs variant='soft-rounded' colorScheme='green'>
                        <TabList mb="1em">
                            <Tab width="50%">Login</Tab>
                            <Tab width="50%">Signup</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Login />
                            </TabPanel>
                            <TabPanel>
                                <Signup />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Container>
        </div>
    )
}
