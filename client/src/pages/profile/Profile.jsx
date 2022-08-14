import React from 'react'
import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import { useContext, useEffect, useState } from "react";
import { useLocation } from 'react-router';
import { useParams } from "react-router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { AuthContext } from "../../context/AuthProvide";
import pic from '../../assets/person/noCover.png'
import pic1 from '../../assets/person/noAvatar.png'

export default function Profile() {
	const PF = "http://localhost:5000/v1/images/" ;
	const [file, setFile] = useState("");
    const [user, setUser] = useState("");
    const [updated, setUpdated] = useState(false);
    const [userUpdateMode, setUserUpdateMode] = useState(false)
    const {auth, logUser, dispatch, setAuth} = useContext(AuthContext);
	console.log(logUser,'profile');
    const axiosPrivate = useAxiosPrivate();
	const [loading, setLoading] = useState(false);
	const [desc, setDesc] = useState('');
	const location = useLocation()
	const path = location.pathname.split("/")[2];
	console.log(path, 'path');
	const username = useParams().username;

	//const username = useParams().username;

	useEffect(() => {
			const fetchUser = async () => {
				try {
				const response = await axiosPrivate.get(`/user?username=${username}`, { withCredentials: true,
					headers:{authorization: `bearer ${auth}`}
				   })  
				   setUser(response.data)
				   console.log(response.data,'data');
		} catch (err) {	
		}
	}
		fetchUser();

	}, [username]);

	return (
		<>
			<Topbar />
			<div className='profile'>
				<Sidebar />
				<div className='profileRight'>
					<div className='profileRightTop'>
						<div className='profileCover'>
							<img
								className='profileCoverImg'
								src={
									user.coverPicture
										? PF + user.coverPicture
										: pic
								}
								alt=''
							/>
							</div>
							<div className="second">
							<div className="profile">
							<img
								className='profileUserImg'
								src={
									user.profilePicture
										? PF + user.profilePicture
										: pic1
								}
								alt=''
							/>
							</div>
						
						<div className='profileInfo'>
							<div className='profileName'>
							<h4 className='profileInfoName'>{user.firstName}</h4>
							<h4 className='p'>{user.lastName}</h4>
							</div>
							<span className='profileInfoDesc'>{user.description}</span>
						</div>
						<div className="button">
							<button className="btn">Add Story</button>
							<button className="btns">Edit Profile</button>
						</div>
							</div>
					</div>
					<hr className='shareHr' />
					<div className='profileRightBottom'>
					<Feed username={username} />
            		<Rightbar user={user} />
					</div>
				</div>
			</div>
		</>
	);
}
