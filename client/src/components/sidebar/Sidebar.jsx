import React from 'react'
import { useState, useContext, useEffect } from 'react';
import "./sidebar.css";
import {
	RssFeed,
	Chat,
	PlayCircleFilledOutlined,
	Group,
	Bookmark,
	HelpOutline,
	WorkOutline,
	Event,
	School,
} from "@material-ui/icons";
import RoomIcon from '@material-ui/icons/Room';
import { Users } from "../../dummyData";
import CloseFriend from "../closeFriend/CloseFriend";
import {AuthContext} from "../../context/AuthProvide";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import {LogContext} from '../../context/LogContext';
import { Link } from 'react-router-dom';

export default function Sidebar() {
	const axiosPrivate = useAxiosPrivate();
    const PF = "http://localhost:5000/images/" 
    const {auth, setAuth, logUser, dispatch} = useContext(AuthContext);
    const {logdispatch} = useContext(LogContext);

    //logout function
    const handleLogout = async (e) =>{
         dispatch({ type: "ISLOADING_START" });
       const logId ={
            userId: logUser.userId
        }
        try{
            
            await axiosPrivate.post(`/logout`,  logId, { withCredentials: true,
            headers:{authorization: `Bearer ${auth.token}`}})
             setAuth(null);
             logdispatch({type:"LOG_SESSION", payload: null});
             dispatch({ type: "ISLOADING_END" });
			 window.location.reload('/login')
        }catch(err){
            setAuth(null)
        }
 
}

	return (
		<div className='sidebar'>
			<div className='sidebarWrapper'>
				<ul className='sidebarList'>
					<li className='sidebarListItem'>
						<RssFeed className='sidebarIcon' />
						<span className='sidebarListItemText'>Feed</span>
					</li>
					<li className='sidebarListItem'>
						<Chat className='sidebarIcon' />
						<span className='sidebarListItemText'>Chats</span>
					</li>
					<li className='sidebarListItem'>
						<PlayCircleFilledOutlined className='sidebarIcon' />
						<span className='sidebarListItemText'>Videos</span>
					</li>
					<li className='sidebarListItem'>
						<Group className='sidebarIcon' />
						<span className='sidebarListItemText'>Groups</span>
					</li>
					<li className='sidebarListItem'>
						<Bookmark className='sidebarIcon' />
						<span className='sidebarListItemText'>Bookmarks</span>
					</li>
					<li className='sidebarListItem'>
						<HelpOutline className='sidebarIcon' />
						<span className='sidebarListItemText'>Questions</span>
					</li>
					<li className='sidebarListItem'>
						<WorkOutline className='sidebarIcon' />
						<span className='sidebarListItemText'>Jobs</span>
					</li>
					<li className='sidebarListItem'>
						<Event className='sidebarIcon' />
						<span className='sidebarListItemText'>Events</span>
					</li>
					<li className='sidebarListItem'>
						<School className='sidebarIcon' />
						<span className='sidebarListItemText'>Courses</span>
					</li>
					<Link to="/login">
					<li className='sidebarListItem' onClick={handleLogout}>
					<RoomIcon className='sidebarIcon' />
                       <span className='sidebarListItemText'>Logout</span>
                    </li>
					</Link>
				</ul>
				<button className='sidebarButton'>Show More</button>
				<hr className='sidebarHr' />
				<ul className='sidebarFriendList'>
					{Users.map((u) => (
						<CloseFriend key={u.id} user={u} />
					))}
				</ul>
			</div>
		</div>
	);
}
