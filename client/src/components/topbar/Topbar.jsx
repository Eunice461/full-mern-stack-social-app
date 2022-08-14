import React from 'react'
import "./topbar.css";
import { Search, Person, Chat, Notifications } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthProvide";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import {LogContext} from '../../context/LogContext';
import { useState } from "react";
import pic from '../../assets/person/noAvatar.png'

export default function Topbar() {
	const axiosPrivate = useAxiosPrivate();
	const PF = "http://localhost:5000/images/" ;
    const {auth, setAuth, logUser} = useContext(AuthContext);
	console.log(logUser,'me');
    const {logdispatch} = useContext(LogContext);
    const [query, setQuery] = useState('')


	return (
		<div className='topbarContainer'>
			<div className='topbarLeft'>
				<Link to='/' style={{ textDecoration: "none" }}>
					<span className='logo'>DaraSocial</span>
				</Link>
			</div>
			<div className='topbarCenter'>
				<div className='searchbar'>
					<Search className='searchIcon' />
					<input
						placeholder='Search for friend, post or video'
						className='searchInput'
					/>
				</div>
			</div>
			<div className='topbarRight'>
				<div className='topbarLinks'>
					<span className='topbarLink'>Homepage</span>
					<span className='topbarLink'>Timeline</span>
				</div>
				<div className='topbarIcons'>
					<div className='topbarIconItem'>
						<Person />
						<span className='topbarIconBadge'>1</span>
					</div>
					<Link to='/messenger' style={{ color: "white" }}>
						<div className='topbarIconItem'>
						<Chat />
						<span className='topbarIconBadge'>2</span>
						</div>
						</Link>
					
					<div className='topbarIconItem'>
						<Notifications />
						<span className='topbarIconBadge'>1</span>
					</div>
				</div>
				<span className='username'>{logUser.username}</span>
				{
				auth?.token ? (
                   <Link to={`/profile/${logUser.username}`}>
                    <img className='topbarImg' 
                        src={
							logUser.profilePicture
								? PF + logUser.profilePicture
								: pic
						} alt="" 
                    />
                </Link>
               ) : (
                            <li>null</li>
			   )
						}
	
				{/* <Link to={`/profile/${logUser.username}`}>
				{/* <Link to={`/profile/`}> */}
				{/* <img
						src={
							logUser.profilePicture
								? PF + logUser.profilePicture
								: pic
						}
						alt=''
						className='topbarImg'
					/>
				</Link> */} 
			</div>
		</div>
	);
}
