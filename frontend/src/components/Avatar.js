import React from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    // useDisclosure,
} from '@chakra-ui/react'
const Avatar1 = ({ info, isOpen, onClose }) => {
    // console.log(info)
    const isSmall = window.innerWidth < 500

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent style={isSmall ? { width: '80vw', height: '60vh', textAlign: 'center' } : { textAlign: 'center' }}>
                    <ModalHeader style={isSmall ? { fontSize: '1.5rem' } : { fontSize: '2.5rem' }}>{info.name}</ModalHeader>
                    <ModalCloseButton />
                    <img style={{ height: '15rem', objectFit: 'contain' }} src={info.profilePic} />
                    <ModalBody style={{ fontSize: '1.5rem' }}><b style={{ marginRight: '1rem' }}>Email:</b>
                        {info.email}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}


export default Avatar1
