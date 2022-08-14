import React from 'react'
import "./share.css";
import {
	PermMedia,
	Label,
	Room,
	EmojiEmotions,
	Cancel,
} from "@material-ui/icons";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthProvide";
import axios from "axios";
import { LoginContext } from "../../context/LogContext";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import pic1 from '../../assets/person/noAvatar.png'

export default function Share() {
	const PF = "http://localhost:5000/images/" ;
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    const {auth, logUser, dispatch} = useContext(AuthContext);
    const [userNotFoundError, setUserNotFounderError] = useState(false);
    const [blockedUserError, setBlockedUserError] = useState(false);
    const [verifiedUserError, setVerifiedUserError] = useState(false);
    const [imgeUploadText, setImageUploadText] = useState(false)

	const submitHandler = async (e) => {
		e.preventDefault();
     dispatch({type:"CURSOR_NOT_ALLOWED_START"});
   
   //logic behind uploading image and the image name
    if(file){                    
        const data = new FormData();
        const filename = Date.now() + file.name;
        data.append("name", filename);
        data.append("file", file);
        data.append("email", logUser.userId);
        data.append("role", logUser.role);
        data.append("description", description);
        try{
       
            const response = await axiosPrivate.post(`/post`,  data,{ withCredentials: true,
            headers:{authorization: `Bearer ${auth.token}`}
           
        },)
        window.location.replace("/post/" + response.data._id, );
      
        
    }catch(err){
         dispatch({type:"CURSOR_NOT_ALLOWED_START_END"});
        console.log(err)

        if(err.response === 'Sorry, you can not make a post at this moment'){
            return setBlockedUserError(true)
        };
        if(err.response === 'Only verified users can perform this action'){
             return setVerifiedUserError(true)
        }
       
    }
    }else{
        setImageUploadText(true)
        dispatch({type:"CURSOR_NOT_ALLOWED_START_END"});
    }
    

};

//useEffect to clear error messages after some seconds

useEffect(()=>{
    setTimeout(() => {
        setUserNotFounderError(false)
    }, 2000);

    setTimeout(() => {
        setBlockedUserError(false)
    }, 2000);

     setTimeout(() => {
        setBlockedUserError(false)
    }, 2000);

    setTimeout(() => {
        setVerifiedUserError(false)
    }, 2000);

    setTimeout(() => {
        setImageUploadText(false)
    }, 2000);


}, [userNotFoundError, blockedUserError, verifiedUserError, 
    imgeUploadText,
    ]);


	return (
		<div className='share'>
			<div className='shareWrapper'>
				<div className='shareTop'>
					<img
						className='shareProfileImg'
						src={
							logUser.profilePicture
								? PF + logUser.profilePicture
								: pic1
						}
						alt=''
					/>
					<input
						placeholder={"What's in your mind " + logUser.username + "?"}
						className='shareInput'
						onChange={e => setDescription(e.target.value)}
						
					/>
				</div>
				<hr className='shareHr' />
				{file && (
					<div className='shareImgContainer'>
						<img className='shareImg' src={URL.createObjectURL(file)} alt='' />
						<Cancel className='shareCancelImg' onClick={() => setFile(null)} />
					</div>
				)}
				<form className='shareBottom' onSubmit={submitHandler}>
					<div className='shareOptions'>
						<label htmlFor='file' className='shareOption'>
							<PermMedia htmlColor='tomato' className='shareIcon' />
							<span className='shareOptionText'>Photo or Video</span>
							<input
								style={{ display: "none" }}
								type='file'
								id='file'
								accept='.png,.jpeg,.jpg'
								onChange={(e) => setFile(e.target.files[0])}
							/>
						</label>
						<div className='shareOption'>
							<Label htmlColor='blue' className='shareIcon' />
							<span className='shareOptionText'>Tag</span>
						</div>
						<div className='shareOption'>
							<Room htmlColor='green' className='shareIcon' />
							<span className='shareOptionText'>Location</span>
						</div>
						<div className='shareOption'>
							<EmojiEmotions htmlColor='goldenrod' className='shareIcon' />
							<span className='shareOptionText'>Feelings</span>
						</div>
					</div>
					<button className='shareButton' type='submit'>
						Share
					</button>
				</form>
			</div>
		</div>
	);
}
