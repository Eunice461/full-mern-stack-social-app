import React from 'react'
import "./post.css";
import { MoreVert } from "@material-ui/icons";
import { useContext, useEffect, useState } from "react";
import axios from "../../hooks/axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvide";
import {useLocation} from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import pic1 from '../../assets/person/noAvatar.png'
import heart from "../../assets/heart.png"
import likee from "../../assets/like.png"
import axiosPrivate from '../../hooks/AxiosPrivate';

export default function Post({ posts }) {
	console.log(posts, 'posts');
	const axiosPrivate = useAxiosPrivate();
    const location = useLocation()
    const path = location.pathname.split("/")[2];
	const [like, setLike] = useState([posts.postLikes.length]);
	const [isLiked, setIsLiked] = useState(false);
	const [user, setUser] = useState({});
	const PF = "http://localhost:5000/v1/images/" ;
	const {auth, isLoading, dispatch, logUser} = useContext(AuthContext);
      const [loading, setLoading] = useState(false);
    // called the useLocation here under a variable called location
    const search = location.search

	useEffect(() => {
		setIsLiked(posts.postLikes.includes(logUser._id));
	  }, [logUser._id, posts.postLikes]);
	
	const likeHandler = async ()=>{
		try{
			const response = await axiosPrivate.patch('/post/' + posts._id + '/like', 
				{ withCredentials: true,headers:{authorization: `Bearer ${auth}`}}
			)
				setLike([response.data]);
	// 			setLike(isLiked ? like - 1 : like + 1);
    // s			etIsLiked(!isLiked);
		}catch(err){
	
		}
	}

    
	return (
		<div className='post'>
			<div className='postWrapper'>
				<div className='postTop'>
					<div className='postTopLeft'>
						<Link to={`/profile/${posts?.user.username}`}>
							<img
								className='postProfileImg'
								src={
									posts?.user?.profilePicture
										? PF + posts?.user.profilePicture
										: pic1
								}
								alt=''
							/>
						</Link>
						<span className='postUsername'>{posts?.user.username}</span>
						<span className='postDate'>{format(posts?.createdAt)}</span>
					</div>
					<div className='postTopRight'>
						<MoreVert />
					</div>
				</div>
				<div className='postCenter'>
					<span className='postText'>{posts?.description}</span>
						<img className='postImg' src={posts?.postPhoto} alt='' />
				</div>
				<div className='postBottom'>
					<div className='postBottomLeft'>
						<img
							className='likeIcon'
							src={heart}
							onClick={likeHandler}
							alt=''
						/>
						<img
							className='likeIcon'
							src={likee}
							onClick={likeHandler}
							alt=''
						/>
						<span className='postLikeCounter'>{like} people like it</span>
					</div>
					<Link to={`/post/${posts._id}`}>
					<div className='postBottomRight'>
						<span className='postCommentText'>{posts?.comments} comments</span>
					</div></Link>
				</div>
			</div>
		</div>
	);
}
