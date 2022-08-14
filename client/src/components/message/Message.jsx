import React from 'react'
import "./message.css";
import { format } from "timeago.js";
import pic1 from '../../assets/person/noAvatar.png'

export default function Message({ message, own }) {
	const PF = "http://localhost:5000/v1/images/" ;

	return (
		<div className={own ? "message own" : "message"}>
			<div className='messageTop'>
				<img
					className='messageImg'
					src={
						message?.profilePicture
							? PF + message.profilePicture
							: pic1
					}
					alt=''
				/>
				<p className='messageText'>{message.content}</p>
			</div>
			<div className='messageBottom'>{format(message.createdAt)}</div>
		</div>
	);
}
