import React from 'react'
import "./messenger.css";
import Topbar from "../../components/topbar/Topbar";
import Conversation from "../../components/conversation/Conversation"
import Message from "../../components/message/Message";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthProvide";
import axios from "../../hooks/axios";
import { io } from "socket.io-client";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useLocation } from 'react-router-dom';

export default function Messenger() {
	const [typing, setTyping] = useState(false);
  	const [istyping, setIsTyping] = useState(false);
	const [conversations, setConversations] = useState([]);
	console.log(conversations, "conversations");
	const [currentChat, setCurrentChat] = useState(null);
	console.log(currentChat,'currentChat')
	const [messages, setMessages] = useState([]);
	console.log(messages,"messages")
	const [newMessage, setNewMessage] = useState("");
	const [arrivalMessage, setArrivalMessage] = useState(null);
	console.log(arrivalMessage,"arrivalMessage")
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [query, setQuery] = useState('')
	const socket = useRef();
	const [socketConnected, setSocketConnected] = useState(false);
	const axiosPrivate = useAxiosPrivate();
	const {auth, isLoading, dispatch, logUser} = useContext(AuthContext);
	console.log(logUser,"logUser")
	const scrollRef = useRef();
	const ENDPOINT = "http://localhost:5000/v1";

	const location = useLocation();// called the useLocation here under a variable called location

    const search = location.search// declared a variable called search, assigned the location.search value to it. this is coming from useLocation. It works with query

    
    useEffect(() => {
        const fetchPosts = async ()=>{
       const res = await axiosPrivate.post("/search/user"+search, 
	   { withCredentials: true,headers:{authorization: `Bearer ${auth}`}});//all we are saying is that fetch the posts with the query search entered. This could be author's name, category, etc
	   setQuery(res.data)
        
        }
        fetchPosts()
    }, [search])

	useEffect(() => {
		socket.current = io(ENDPOINT);
		socket.current.on("getMessage", () => {
			setArrivalMessage({
				sender: senderId,
				content: content,
				createdAt: Date.now(),
			});
		});
    	// socket.current.on("typing", () => setIsTyping(true));
    	// socket.current.on("stop typing", () => setIsTyping(false));

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		arrivalMessage &&
			currentChat?.members.includes(arrivalMessage.sender) &&
			setMessages((prev) => [...prev, arrivalMessage]);
	}, [arrivalMessage, currentChat]);

	useEffect(() => {
		socket.current.emit("addUser", logUser.userId);
		socket.current.on("getUsers", (users) => {
			setOnlineUsers(
				logUser.followings.filter((f) => users.some((u) => u.userId === f))
			);
		});
	}, [logUser]);

	useEffect(() => {
		const getConversations = async () => {
			try {
				const res = await axiosPrivate.get("/conversation/" + logUser.userId,
				{ withCredentials: true,headers:{authorization: `Bearer ${auth}`}});
				setConversations(res.data);
			} catch (err) {
				console.log(err);
			}
		};
		getConversations();
	}, [logUser.userId]);

	useEffect(() => {
		const getMessages = async () => {
			try {
				const res = await axiosPrivate.get("/message/" + currentChat?._id,
				{ withCredentials: true,headers:{authorization: `Bearer ${auth}`}}
				);
				setMessages(res.data);
			} catch (err) {
				console.log(err);
			}
		};
		getMessages();
	}, [currentChat]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const message = {
			sender: logUser.userId,
			content: newMessage,
			conversationId: currentChat._id,
		};

		const receiverId = currentChat.members.find(
			(member) => member !== logUser.userId
		);

		socket.current.emit("sendMessage", {
			senderId: logUser.userId,
			receiverId,
			content: newMessage,
		});

		try {
			const res = await axiosPrivate.post("/message", message);
			setMessages([...messages, res.data]);
			setNewMessage("");
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		scrollRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<>
			<Topbar />
			<div className='messenger'>
				<div className='chatMenu'>
					<div className='chatMenuWrapper'>
						<input placeholder='Search for friends' className='chatMenuInput' onChange={(e)=>setQuery(e.target.value)} />
						{conversations.map((c) => (
							console.log(c,'c'),
							<div onClick={() => setCurrentChat(c)}>
								<Conversation conversation={c} currentUser={logUser} />
		
							</div>
						))}
					</div>
				</div>
				<div className='chatBox'>
					<div className='chatBoxWrapper'>
						{currentChat ? (
							<>
								<div className='chatBoxTop'>
									{messages.map((m) => (
										<div ref={scrollRef}>
											<Message message={m} own={m.sender === logUser.userId} />
										</div>
									))}
								</div>
								<div className='chatBoxBottom'>
									<textarea
										className='chatMessageInput'
										placeholder='write something...'
										onChange={(e) => setNewMessage(e.target.value)}
										value={newMessage}></textarea>
									<button className='chatSubmitButton' onClick={handleSubmit}>
										Send
									</button>
								</div>
							</>
						) : (
							<span className='noConversationText'>
								Open a conversation to start a chat.
							</span>
						)}
					</div>
				</div>
				<div className='chatOnline'>
					<div className='chatOnlineWrapper'>
						<ChatOnline
							onlineUsers={onlineUsers}
							currentId={logUser.userId}
							setCurrentChat={setCurrentChat}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
