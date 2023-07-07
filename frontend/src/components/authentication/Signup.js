import React, { useState } from 'react'
import { Stack, HStack, VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import axios from "axios";
import { useHistory } from "react-router";
import { useToast } from "@chakra-ui/toast";
const isEmail = (mail) => {
    mail = mail.toLowerCase()
    if (mail.includes('.com') && mail.includes('@')) return true
    return false;
}
export default function Signup() {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const toast = useToast();
    const history = useHistory();
    const address = "http://localhost:4000";
    const client = axios.create({ baseURL: address });
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState("");
    const [loading, setloading] = useState(false);
    const [currentuser, setcurrentuser] = useState(null);
    // const [picLoading, setPicLoading] = useState(false);
    const toggleshow = () => {
        setShow(!show)
    }
    const submitHandler = async () => {
        if (!isEmail(email)) { alert('Invalid email'); return; }
        if (confirmpassword !== password) { alert('Passwords dont match'); return; }
        setloading(true)
        client.post('/user/register', {
            name: name,
            email: email,
            password: password,
            profilePic: pic,
        }).then((user) => {
            // setcurrentuser(user.data); 
            setloading(false);
            localStorage.setItem("userinfo", JSON.stringify(user.data))
            window.location.reload()
        })
    }
    const postDetails = (file) => {
        // const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setPic(reader.result);
        };
        reader.readAsDataURL(file);
        // const base64 = convertToBase64(file);
        // console.log(pic)

    }

    return (
        <VStack spacing="5px">
            <FormControl id="first-name" isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    placeholder="Enter Your Name"
                    onChange={(e) => setName(e.target.value)}
                />
            </FormControl>
            <FormControl id="email" isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                    type="email"
                    placeholder="Enter Your Email Address"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                    <Input
                        type={show ? "text" : "password"}
                        placeholder="Enter Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id="password" isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup size="md">
                    <Input
                        type={show ? "text" : "password"}
                        placeholder="Confirm password"
                        onChange={(e) => setConfirmpassword(e.target.value)}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id="pic">
                <FormLabel>Upload your Picture</FormLabel>
                <Input
                    type="file"
                    p={1.5}
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                />
            </FormControl>
            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Sign Up
            </Button>
        </VStack>
    )
}
