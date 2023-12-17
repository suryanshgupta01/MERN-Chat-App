import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Avatar, Button, Input, Menu, MenuButton, MenuItem, MenuList, Select, Spinner, Text, Tooltip, useDisclosure, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, } from '@chakra-ui/react';
import ReactScrollToBottom from 'react-scroll-to-bottom'
import { TriangleDownIcon, ChevronDownIcon, ViewIcon } from '@chakra-ui/icons'
import Avatar1 from '../components/Avatar';
import Loading from '../components/Loading';

export default function Chatpage() {
    const address = "http://localhost:4000";
    const [chats, setchats] = useState([]);
    const [users, setusers] = useState([]);
    const [selected, setselected] = useState([]);
    const [loading, setloading] = useState(true);
    const [active, setactive] = useState({ name: "SELECT USER TO INTERACT", email: "", conversation: [], people: [{ email: "" }, { email: "" }], _id: "" });
    const [opponentinfo, setopponentinfo] = useState({});
    const msgref = useRef("")



    const client = axios.create({
        baseURL: address
    });
    const userinfo = JSON.parse(localStorage.getItem('userinfo'))

    const fetchusers = async () => {
        setloading(true)
        const { data } = await client.get("/user", {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${userinfo.token}`
            }
        })
        setusers(data.filter((ele) => { return ele._id.toString() !== userinfo._id }))
        setloading(false)
    }

    const fetchchats = async () => {
        setloading(true)
        const { data } = await client.get(`/chat`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${userinfo.token}`
            }
        })
        // console.log( (userinfo._id))
        setchats(data)
        setloading(false)
        // console.log(data)

    }
    // console.log(typeof(userinfo._id))
    const fetchmsgs = async () => {
        setloading(true)
        const { data } = await client.get(`/msg/${userinfo._id}`)
        // setmessage(data)
        setloading(false)
    }
    const fetchselectedchat = async () => {
        setloading(true)
        const data = selected.filter((ele) => { return ele.isselected })
        // setselectedchat(data)
        setloading(false)

    }
    useEffect(() => {

        fetchusers()
        fetchchats()

        // fetchmsgs()
        // fetchselectedchat()

    }, []);
    const searchuser = (name1) => {
        if (name1 === "") {
            // console.log("name", name1)
            setselected([])
        }
        else {
            name1 = name1.toLowerCase()
            setselected(users.filter((ele) => ele.name.toLowerCase().includes(name1)))
        }
        // console.log(selected)
    }
    const findconversation = (ele) => {
        // console.log(ele)
        const ID = ele._id
        msgref.current.focus()
        const result = chats.filter((ele) => { return (ele._id.toString() === ID) })
        setactive(result[0])
        // console.log(result[0])
        if (result[0].people[0]._id === userinfo._id) setopponentinfo(result[0].people[1])
        else setopponentinfo(result[0].people[0])
    }
    const createConversation = async (ele) => {
        client.post('/chat/create', {
            people: [userinfo._id, ele._id],
            isselected: true,
            conversation: [],
        }, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${userinfo.token}`
            }
        })
            .then((data) => {
                // console.log(data.data)
                const ID = data.data._id
                setchats(prevState => [data.data, ...prevState])
                setactive(data.data)
            })
        onClose()
        // console.log(ele)
        const ID = ele._id
        const result = chats.filter((ele1) => { return ((ele1.people[0]._id.toString() === ID) || (ele1.people[1]._id.toString() === ID)) })
        if (result[0] !== undefined)
            setactive(result[0])
        if (result[0].people[0]._id === userinfo._id) setopponentinfo(result[0].people[1])
        else setopponentinfo(result[0].people[0])
    }
    const deleteConversation = async (ele) => {
        // console.log(ele)
        ele.conversation.map((element) => {
            const ID = element._id
            // console.log(element)
            client.delete(`/msg/delete/${ID}`)
        })
        client.delete(`/chat/delete/${ele._id}`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${userinfo.token}`
            }
        })
            .catch(() => alert("Error deleting message"))
        const remaining = chats.filter((element) => { return element._id !== ele._id })
        setchats(remaining)
    }
    const submitmessage = () => {
        const inputval = msgref.current.value
        if (inputval.trim() === "") return;
        msgref.current.value = ""
        client.post('/msg/create',
            { sender: userinfo._id, content: inputval, reciever: opponentinfo._id }, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${userinfo.token}`
            }
        })
            .then(({ data }) => {
                client.put(`chat/addmsg/${active._id}`, { latestmessage: data._id })
                setactive(prevState => ({
                    ...prevState,
                    conversation: [...prevState.conversation, { sender: userinfo._id, content: inputval, reciever: opponentinfo._id, createdAt: (new Date()) }]
                }))
                const ID = active._id
                setchats((prevChats) => {
                    if (!prevChats || prevChats.length == 0) {
                        // Handle the case where 'chats' is undefined or an empty array
                        return prevChats;
                    }
                    return prevChats.map((ele) => {
                        if (ele._id.toString() === ID) {
                            return {
                                ...ele,
                                conversation: [...ele.conversation, { sender: userinfo._id, content: inputval, reciever: opponentinfo._id, createdAt: (new Date()) }],
                                latestmessage: { sender: userinfo._id, content: inputval, reciever: opponentinfo._id }
                            };
                        }
                        return ele;
                    });
                });
            })
            .catch(() => alert("Error sending message"))
        // console.log(active)
        msgref.current.focus()
    }

    const logouthandler = () => {
        localStorage.removeItem('userinfo')
        window.location.reload()
    }

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAvatarOpen, onOpen: onAvatarOpen, onClose: onAvatarClose } = useDisclosure()
    const { isOpen: isOpponentOpen, onOpen: onOpponentOpen, onClose: onOpponentClose } = useDisclosure()
    const btnRef = React.useRef()
    const isSmall = window.innerWidth < 500
    const smallandnotactive = active.email === ""
    const smallandactive = active.email !== ""
    console.log(active)
    if (loading) return <Loading />


    return (
        <>
            <div className='megadiv'>

                <div className='navbar'>
                    <Tooltip hasArrow arrowSize={15} label='Tap to find user' bg='red.900'>
                        <Button ref={btnRef} colorScheme='green' onClick={onOpen}>
                            Search User
                        </Button>
                    </Tooltip>
                    <p >MERN STACK CHAT APP</p>
                    <div className="btn-group " style={{ right: '30px' }} >
                        <button type="button" className="btn btn-success dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            {/* <img src={userinfo.profilePic} alt='user pic here' style={{ objectFit: 'cover', width: '30px', height: '30px', borderRadius: '50%' }} /> */}

                            <Avatar name={userinfo.name} src={userinfo.profilePic} />
                        </button>
                        <ul className="dropdown-menu" >
                            <li className="dropdown-item" onClick={onAvatarOpen}>
                                Profile
                                <Avatar1 info={userinfo} onClose={onAvatarClose} isOpen={isAvatarOpen} />
                            </li>
                            <li className="dropdown-item" onClick={logouthandler}>Logout</li>
                        </ul>
                    </div>
                </div>
                <div className='chatbox'>
                    <div className='userlist'
                        style={isSmall ? { width: (smallandnotactive ? '100vw' : '0vw'), display: (smallandnotactive ? 'block' : 'none') } : null}
                    >

                        <Drawer
                            isOpen={isOpen}
                            placement='left'
                            onClose={onClose}
                            finalFocusRef={btnRef}
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerCloseButton />
                                <DrawerHeader>Search user to chat</DrawerHeader>

                                <DrawerBody>
                                    <Input placeholder='Search...' onChange={(e) => searchuser(e.target.value)} />
                                    {selected?.map((ele) => (
                                        <>
                                            <p className='singlename' value={ele._id} key={ele._id} onClick={() => createConversation(ele)}>
                                                <Avatar name={ele.name} src={ele.profilePic} />
                                                {/* <img src={ele.profilePic} style={{ objectFit: 'cover' }} /> */}
                                                <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column' }}>
                                                    {ele.name}
                                                    <span>{ele.email}</span>
                                                </div>
                                            </p>
                                        </>
                                    ))}

                                </DrawerBody>

                                <DrawerFooter>
                                    <Button variant='outline' mr={3} onClick={onClose}>
                                        Cancel
                                    </Button>
                                    {/* <Button colorScheme='blue'>Save</Button> */}
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                        <div className='names' >
                            {chats?.map((ele) => (
                                <>
                                    {ele.isselected ? (
                                        <p className='singlename' value={ele._id} key={ele._id} >
                                            <div style={{ display: 'flex', flexDirection: 'row' }} onClick={() => findconversation(ele)}>
                                                <Avatar name={ele.people[0]._id.toString() === userinfo._id ? ele.people[1].name : ele.people[0].name} src={ele.people[0]._id.toString() === userinfo._id ? ele.people[1].profilePic : ele.people[0].profilePic} />

                                                {/* <img src={ele.people[0]._id.toString() === userinfo._id ? ele.people[1].profilePic : ele.people[0].profilePic} style={{ objectFit: 'cover', width: '50px', height: '50px' }} /> */}
                                                <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column' }}>
                                                    {ele.people[0]._id.toString() === userinfo._id ? ele.people[1].name : ele.people[0].name}
                                                    <br />
                                                    {ele.latestmessage ? (
                                                        <p>{
                                                            ele.latestmessage.content.length > 12 ?
                                                                ele.latestmessage.content.slice(0, 12) + '...' : ele.latestmessage.content}
                                                        </p>
                                                    ) : <p>(No messages yet) </p>}
                                                </div>
                                            </div>
                                            {/* functionality to deselect chat */}
                                            {/* <div className='deselect'><i className="fa fa-times" style={{ fontSize: '20px' }} aria-hidden="true"></i></div> */}
                                            <div className='delete' onClick={() => {
                                                deleteConversation(ele)
                                            }}
                                            >
                                                <i className="fa fa-trash deletebutton" style={{ fontSize: '20px' }} aria-hidden="true"></i></div>
                                        </p>) : null}
                                </>
                            ))}
                        </div>
                    </div>

                    <div className='convobox'
                        style={isSmall ? { width: (smallandactive ? '100vw' : '0vw'), display: (smallandactive ? 'block' : 'none') } : null}
                    // style={{ display: (isSmall ? 'block' : 'none') }}
                    >
                        <div className='heading'><i className="fa-solid fa-arrow-left"
                            onClick={() => {
                                setactive({ name: "SELECT USER TO INTERACT", email: "", people: [{ email: "" }, { email: "" }], _id: "" });
                                setopponentinfo({})
                            }}></i>
                            <p>{active.people[0].email === userinfo.email ? active.people[1].name : active.people[0].email === "" ? active.name : active.people[0].name}</p>
                            <ViewIcon onClick={onOpponentOpen} />
                            <Avatar1 info={opponentinfo} onClose={onOpponentClose} isOpen={isOpponentOpen} />

                        </div>
                        <ReactScrollToBottom className='convo'>
                            {active.email !== "" ?
                                <>
                                    {active.conversation?.map((ele) =>
                                    (<div className={'singlechat ' + (ele.sender === userinfo._id ? ' right' : 'left')} key={ele._id}>
                                        {/* {ele.sender === userinfo._id ? 'YOU' : opponentname}: */}
                                        {ele.content}
                                        <p className='time'>
                                            {(new Date(ele.createdAt).getHours() > 12) ?
                                                (new Date(ele.createdAt).getHours() - 12) + ":" + (new Date(ele.createdAt).getMinutes()) + " " + "PM" + " "
                                                : (new Date(ele.createdAt).getHours()) + ":" + (new Date(ele.createdAt).getMinutes()) + " " + "AM" + " "
                                            }
                                            {/* {(new Date(ele.createdAt).getDate()) + "/" + (new Date(ele.createdAt).getMonth())} */}
                                        </p></div>
                                    ))}
                                </>
                                : <p className='noneselect'>NO SELECTED CHAT</p>
                            }
                        </ReactScrollToBottom>
                        <div className='msginput'>
                            <input type="text" ref={msgref} placeholder="Type a message.." disabled={(active.email === "" ? true : false)}
                                onKeyDown={(e) => (e.key === 'Enter') ? submitmessage() : null}
                            />
                            <button onClick={submitmessage}>SEND</button>
                        </div>
                    </div>
                </div>
                <div className='footer'>Created and owned by Suryansh Gupta - <b><a href='https://github.com/suryanshgupta01/MERN-Chat-App/'>Github</a></b></div>
            </div >
        </>

    )
}
