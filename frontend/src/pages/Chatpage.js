import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Avatar, Button, Input, Menu, MenuButton, MenuItem, MenuList, Select, Spinner, Text, Tooltip, useDisclosure, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, } from '@chakra-ui/react';
import ReactScrollToBottom from 'react-scroll-to-bottom'
import { TriangleDownIcon, ChevronDownIcon, ViewIcon } from '@chakra-ui/icons'
import Avatar1 from '../components/Avatar';
import Loading from '../components/Loading';
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../components/Animation - Typing.json";

const address = "http://localhost:4000";
var socket
const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};
export default function Chatpage() {
    const [chats, setchats] = useState([]);
    const [users, setusers] = useState([]);
    const [selected, setselected] = useState([]);
    const [loading, setloading] = useState(true);
    const [active, setactive] = useState({ name: "SELECT USER TO INTERACT", email: "", conversation: [], people: [{ email: "" }, { email: "" }], _id: "" });
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [opponentinfo, setopponentinfo] = useState({});
    const msgref = useRef("")
    const userinfo = JSON.parse(localStorage.getItem('userinfo'))

    useEffect(() => {
        socket = io(address);
        socket.emit("setup", userinfo);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stoptyping", () => setIsTyping(false));
    }, []);

    useEffect(() => {
        socket.on("msg received", (msg) => {
            console.log(msg)
            setactive(prevState => {
                const n = prevState.conversation.length;
                if (n === 0 || getcustomedate(prevState.conversation[n - 1]) !== getcustomedate({ createdAt: new Date() })) {
                    prevState = {
                        ...prevState,
                        conversation: [...prevState.conversation, { isDate: true, message: getcustomedate({ createdAt: new Date() }) }]
                    };
                }
                if (n == 0 || prevState.conversation[n - 1].isDate || msg._id !== prevState.conversation[n - 1]._id) {
                    return {
                        ...prevState,
                        conversation: [...prevState.conversation, msg]
                    }
                } else return prevState
            });
            const recieverID = msg.reciever
            const senderID = msg.sender
            setchats(prevChats => {
                return prevChats.map((ele) => {
                    if (((ele.people[0]._id.toString() === recieverID && ele.people[1]._id.toString() === senderID) || (ele.people[0]._id.toString() === senderID && ele.people[1]._id.toString() === recieverID)) && (msg._id !== ele.latestmessage._id)) {
                        
                        return {
                            ...ele,
                            conversation: [...ele.conversation, msg],
                            latestmessage: msg
                        };
                    } else {
                        return ele;
                    }
                })
            })
        });
    }, []);
    const client = axios.create({
        baseURL: address
    });

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
    const months = ['January', 'February', 'Marcch', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const getcustomedate = (ele) => {
        var month = months[new Date(ele.createdAt).getMonth()]
        var date = new Date(ele.createdAt).getDate()
        return month + " " + date
    }
    const addDates = (data) => {
        const newdata = data.map((ele, index) => {
            var n = ele.conversation.length
            if (n == 0) return ele
            var last = getcustomedate(ele.conversation[n - 1])
            for (var i = n - 1; i >= 0; i--) {
                if (last === getcustomedate(ele.conversation[i])) continue;
                ele.conversation.splice(i + 1, 0, { isDate: true, message: last })
                last = getcustomedate(ele.conversation[i])
            }
            ele.conversation.splice(0, 0, { isDate: true, message: last })
            return ele
        })
        return newdata
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
        const updated = addDates(data)
        setchats(updated)
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
        socket.emit("join chat", result[0]._id);
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
                setchats(prevState => [data.data, ...prevState])
                setactive(data.data)
                setopponentinfo(ele)
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
        setactive({ name: "SELECT USER TO INTERACT", email: "", conversation: [], people: [{ email: "" }, { email: "" }], _id: "" })
    }
    const submitmessage = () => {
        const inputval = msgref.current.value
        if (inputval.trim() === "") return;
        msgref.current.value = ""
        socket.emit("stoptyping", active._id);

        client.post('/msg/create',
            { sender: userinfo._id, content: inputval, reciever: opponentinfo._id, createdAt: new Date() }, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${userinfo.token}`
            }
        })
            .then(({ data }) => {
                client.put(`chat/addmsg/${active._id}`, { latestmessage: data._id })
                socket.emit("new msg", data)
                setactive(prevState => {
                    const n = prevState.conversation.length;
                    if (n === 0 || getcustomedate(prevState.conversation[n - 1]) !== getcustomedate({ createdAt: new Date() })) {
                        prevState = {
                            ...prevState,
                            conversation: [...prevState.conversation, { isDate: true, message: getcustomedate({ createdAt: new Date() }) }]
                        };
                    }
                    //socket io laga diya
                    if (n == 0 || prevState.conversation[n - 1].isDate || data._id !== prevState.conversation[n - 1]._id)
                        return {
                            ...prevState,
                            conversation: [...prevState.conversation, data]
                        };
                    else return prevState
                });
                const recieverID = data.reciever
                const senderID = data.sender
                var index = -1
                setchats(prevChats => {
                    return prevChats.map((ele, ind) => {
                        if ((ele.people[0]._id.toString() === recieverID && ele.people[1]._id.toString() === senderID) || (ele.people[0]._id.toString() === senderID && ele.people[1]._id.toString() === recieverID)) {
                            
                            index = ind
                            return {
                                ...ele,
                                conversation: [...ele.conversation, data],
                                latestmessage: data
                            };
                        } else {
                            return ele;
                        }
                    })
                })
                setchats((prevChats) => {
                    if (index === -1) return prevChats;
                    const removedElement = prevChats.splice(index, 1)[0];
                    return [removedElement, ...prevChats];
                });
            })
            .catch(() => alert("Error sending message"))
        // console.log(active)
        msgref.current.focus()
    }
    const handlefilesubmit = (e) => {
        e.preventDefault()
        const file = new FileReader()
        file.onloadend = () => {
            setpreviewinfo({
                preview: true,
                name: "PREVIEW",
                previewpic: file.result,
                receiver: opponentinfo.name,
                sendfile: () => {
                    msgref.current.value = file.result
                    submitmessage()
                }
            })
            onPreviewOpen()
        }
        file.readAsDataURL(e.target.files[0])

    }
    const prettifyTime = (time) => {
        var hour = new Date(time).getHours()
        var min = new Date(time).getMinutes()
        var suffix = "AM";
        if (hour >= 12) { hour -= 12; suffix = "PM" }
        if (hour.toString().length === 1) hour = "0" + hour.toString()
        if (min.toString().length === 1) min = "0" + min.toString()
        return hour + ":" + min + " " + suffix
    }
    const handleTyping = () => {
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", active._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 2000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stoptyping", active._id);
                setTyping(false);
            }
        }, timerLength);
    }
    const isImage = (url) => {
        if (url === undefined) return false;
        if (url.startsWith("data:image") && url.includes('base64')) return true;
        return false
    }
    const logouthandler = () => {
        localStorage.removeItem('userinfo')
        window.location.reload()
    }
    const [previewinfo, setpreviewinfo] = useState({});
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAvatarOpen, onOpen: onAvatarOpen, onClose: onAvatarClose } = useDisclosure()
    const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
    const { isOpen: isOpponentOpen, onOpen: onOpponentOpen, onClose: onOpponentClose } = useDisclosure()
    const btnRef = React.useRef()
    const isSmall = window.innerWidth < 500
    const smallandnotactive = active.email === ""
    const smallandactive = active.email !== ""
    // console.log(active)
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
                                                        !isImage(ele.latestmessage.content) ? (
                                                            <p>
                                                                {ele.latestmessage.content.length > 20
                                                                    ? ele.latestmessage.content.slice(0, 20).toLowerCase() + '...'
                                                                    : ele.latestmessage.content}
                                                            </p>
                                                        ) : (
                                                                <p className='makerow'><img src={ele.latestmessage.content} height="10px" style={{borderRadius:'0', marginRight:'10px'}}/> Photo</p>
                                                        )
                                                    ) : (
                                                        <p>No messages yet</p>
                                                    )}
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

                    {/* <div className='convobox' style={{ pointerEvents: active.email === "" ? 'none' : 'auto' }}
                        style={isSmall ? { width: (smallandactive ? '100vw' : '0vw'), display: (smallandactive ? 'block' : 'none') } : null}> */}
                    <div className='convobox' style={{
                        pointerEvents: active.email === "" ? 'none' : 'auto',
                        ...(isSmall ? { width: smallandactive ? '100vw' : '0vw', display: smallandactive ? 'block' : 'none' } : null),
                    }}>
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
                                    {active.conversation?.map((ele, ind) =>
                                        (ele.isDate) ? <p className='date'>
                                            {ele.message}
                                        </p> :
                                            (<div className={'singlechat ' + (ele.sender === userinfo._id ? ' right' : 'left')} key={ele._id}>
                                                {/* {ele.sender === userinfo._id ? 'YOU' : opponentname}: */}
                                                {isImage(ele.content) ? <img src={ele.content} style={{width:'22.5rem'}} alt="image should be here"/> : ele.content}
                                                <p className='time'>
                                                    {prettifyTime(ele.createdAt)}
                                                </p></div>
                                            ))}
                                </>
                                : <p className='noneselect'>NO SELECTED CHAT</p>
                            }
                            {istyping ? <div className='typing'>
                                <Lottie
                                    options={defaultOptions}
                                    // height={50}
                                    width={70}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />
                            </div> : <></>}
                        </ReactScrollToBottom>
                        <div className='msginput'>

                            <label htmlFor="file" className="sendfile">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#000000"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4" />
                                    <path d="M14 2v6h6" />
                                    <path d="M2 15h10" />
                                    <path d="M9 18l3-3-3-3" />
                                </svg>
                            </label>

                            <Avatar1 info={previewinfo} onClose={onPreviewClose} isOpen={isPreviewOpen} />
                            <input type="file" name="file" id="file" style={{ display: 'none' }} accept='image/*' onChange={(e) => handlefilesubmit(e)} />
                            <input type="text" ref={msgref} placeholder="Type a message.." onChange={() => handleTyping()}
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
