import React from 'react'
import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "../../hooks/axios";
import { AuthContext } from "../../context/AuthProvide";
import { LogContext } from "../../context/LogContext";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';


export default function Feed({ username }) {
	const [posts, setPosts] = useState([]);
	const {auth, setAuth, logUser, temp} = useContext(AuthContext);
	console.log(logUser,"feed");
    const {logdispatch} = useContext(LogContext);
	const axiosPrivate = useAxiosPrivate();
    const [query, setQuery] = useState('')

	useEffect(() => {
		const fetchPosts = async () => {
			const res = username
				? await axiosPrivate.get("/post/get/profile/" + username ,{ withCredentials: true,
					headers:{authorization: `Bearer ${auth.token}`}
				},)
				: await axiosPrivate.get("/post/get/timeline", { withCredentials: true,
					headers:{authorization: `Bearer ${auth.token}`}
				},)
			setPosts(res.data)
		};
		fetchPosts();
	}, [username, logUser._id]);

	return (
		<div className='feed'>
			<div className='feedWrapper'>
				{(!username || username === logUser.username) && <Share />}

				{posts.map((singlePost, index)=>{
                
               return <Post posts={singlePost} key={index}/>
})}
			</div>
		</div>
	);
}
