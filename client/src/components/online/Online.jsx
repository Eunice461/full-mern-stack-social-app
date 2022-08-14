import "./online.css";
import React from 'react'

export default function Online({ user }) {
	const PF = "http://localhost:5000/v1/images/" ;

	return (
		<li className='rightbarFriend'>
			<div className='rightbarProfileImgContainer'>
				<img
					className='rightbarProfileImg'
					src={user.profilePicture}
					alt=''
				/>
				<span className='rightbarOnline'></span>
			</div>
			<span className='rightbarUsername'>{user.username}</span>
		</li>
	);
}
