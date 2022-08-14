import React from 'react'
import "./rightbar.css";
import { Users } from "../../dummyData";
import Online from "../online/Online";
import { useContext, useEffect, useState } from "react";
import axios from "../../hooks/axios";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvide";
import { Add, Remove } from "@material-ui/icons";
import { useRef } from "react";
import { LogContext } from "../../context/LogContext";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import gift from "../../assets/gift.png"
import ad from "../../assets/hey.png"
import pic from '../../assets/person/noAvatar.png'

export default function Rightbar({ user }) {
	const PF = "http://localhost:5000/images/" ;
	const desc = useRef();
	const [file, setFile] = useState(null);
	const axiosPrivate = useAxiosPrivate();
    const {auth, setAuth, logUser, dispatch} = useContext(AuthContext);
	console.log(logUser, 'right');
    const {logdispatch} = useContext(LogContext);
    const [query, setQuery] = useState('')
	const [loading, setLoading] = useState(false);
    const location = useLocation()

	const [friends, setFriends] = useState([]);
	const [followed, setFollowed] = useState(
		// logUser.followings.includes(user?.id)
		logUser.followings
	);

	const search = location.search

	useEffect(() => {
		const getFriends = async () => {
		  try {
			const friendList = await axiosPrivate.get(`/user/get/friends`, { withCredentials: true,
				headers:{authorization: `Bearer ${auth.token}`}
			},);
			setFriends(friendList.data);
		  } catch (err) {
			console.log(err);
		  }
		};
		getFriends();
	  }, []);
	
	  const handleClick = async () => {
		try {
		  if (followed) {
			await axios.patch(`/user/${user._id}/unfollow`, {
			  userId: logUser._id,
			});
			dispatch({ type: "UNFOLLOW", payload: user._id });
		  } else {
			await axios.patch(`/user/${user._id}/follow`, {
			  userId: logUser._id,
			});
			dispatch({ type: "FOLLOW", payload: user._id });
		  }
		  setFollowed(!followed);
		} catch (err) {
		}
	  };
	
	  const HomeRightbar = () => {
		return (
		  <>
			<div className="birthdayContainer">
			  <img className="birthdayImg" src={gift} alt="" />
			  <span className="birthdayText">
				<b>Pola Foster</b> and <b>3 other friends</b> have a birhday today.
			  </span>
			</div>
			<img className="rightbarAd" src={ad} alt="" />
			<h4 className="rightbarTitle">Online Friends</h4>
			<ul className="rightbarFriendList">
			  {Users.map((u) => (
				<Online key={u.id} user={u} />
			  ))}
			</ul>
		  </>
		);
	  };
	
	  const ProfileRightbar = () => {
		return (
		  <>
			{user.username !== logUser.username && (
			  <button className="rightbarFollowButton" onClick={handleClick}>
				{followed ? "Unfollow" : "Follow"}
				{followed ? <Remove /> : <Add />}
			  </button>
			)}
			<h4 className="rightbarTitle">User information</h4>
			<div className="rightbarInfo">
			  <div className="rightbarInfoItem">
				<span className="rightbarInfoKey">City:</span>
				<span className="rightbarInfoValue">{user.city}</span>
			  </div>
			  <div className="rightbarInfoItem">
				<span className="rightbarInfoKey">From:</span>
				<span className="rightbarInfoValue">{user.from}</span>
			  </div>
			  <div className="rightbarInfoItem">
				<span className="rightbarInfoKey">Relationship:</span>
				<span className="rightbarInfoValue">
				  {user.relationship === 1
					? "Single"
					: user.relationship === 1
					? "Married"
					: "-"}
				</span>
			  </div>
			</div>
			<h4 className="rightbarTitle">User friends</h4>
			<div className="rightbarFollowings">
			  {friends.map((friend) => (
				<Link
				  to={"/profile/" + friend.username}
				  style={{ textDecoration: "none" }}
				>
				  <div className="rightbarFollowing">
					<img
					  src={
						friend.profilePicture
						  ? PF + friend.profilePicture
						  : pic
					  }
					  alt=""
					  className="rightbarFollowingImg"
					/>
					<span className="rightbarFollowingName">{friend.username}</span>
				  </div>
				</Link>
			  ))}
			</div>
		  </>
		);
	  };
	  return (
		<div className="rightbar">
		  <div className="rightbarWrapper">
			{user ? <ProfileRightbar /> : <HomeRightbar />}
		  </div>
		</div>
	  );
	}