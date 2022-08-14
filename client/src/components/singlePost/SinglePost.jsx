import { useLocation } from 'react-router';
import React, {useEffect, useState, useContext} from 'react';
import './singlePost.css';
import { Link } from 'react-router-dom';
import Comments from "../comment/Comment";
import {AuthContext} from '../../context/AuthProvide';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import PageLoader from '../pageloader/PageLoader';
import {AiOutlineLike} from 'react-icons/ai';
import {MdCancel} from 'react-icons/md';
import Topbar from '../topbar/Topbar';
import Sidebar from '../sidebar/Sidebar';



//import Helmet from '../socialshare/Helmet';

export default function SinglePost() {
    
    const axiosPrivate = useAxiosPrivate();
    const location = useLocation()
    const path = location.pathname.split("/")[2];
    const [post, setPost] = useState([]);
    const PF = "http://localhost:5000/images/" // making the image folder publicly visible
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("");
    const [updateMode, setUpdateMode] = useState(false)
    const [categories, setCategories] = useState();
    const [username, setUsername] = useState();
    const [isLoading, setIsLoading] = useState(false);   
    let currentUrl = `http://www.localhost:3000/post/${path}`;
    const {auth, logUser, dispatch, authorDetails, setAuthorDetails} = useContext(AuthContext);
    const [liked, setLiked] = useState();
    const [file, setFile] = useState("");
    const [editImageMode, setEditImageMode] = useState(false);
    const [updatePostError, setUpdatePostError] = useState(false);


//anytime the path changes, trigger the useeffects by fetching the posts with that path
    useEffect(() => {
       const getPost = async () => {
           try{
              setIsLoading(true)
            const response = await axiosPrivate.get(`/post/${path}`, { withCredentials: true,
            headers:{authorization: `Bearer ${auth.token}`}})
            console.log(response.data)
            setUsername(response.data.user)
            console.log(username);
            setPost([response.data]);
            setDescription(response.data.description);
            setLiked(response.data.postLikes)
            //set author's details globally
            setAuthorDetails(response.data.username)
            setIsLoading(false)
            
           }catch(err){

           }
       };
      getPost()
    }, [path]);
    

//handles deleting post
    const handleDelete = async () =>{
        try{
                await axiosPrivate.delete(`/posts/${path}`, {data: {username: logUser.userId, role: logUser.role}}, { withCredentials: true,
                    headers:{authorization: `Bearer ${auth}`}
                    });
                  window.location.replace("/")
        }catch(err){

        }
    }
//this function handles the update of the post by the user
const handleUpdate = async () =>{
     dispatch({type:"CURSOR_NOT_ALLOWED_START"});
     
        const data = new FormData();
        const filename = Date.now() + file.name;
        data.append("name", filename);
        data.append("file", file);
        data.append("username", logUser.userId);
        data.append("role", logUser.role);
        data.append('description', description)
        try{
                await axiosPrivate.patch(`/v1/posts/${path}`, data, { withCredentials: true,headers:{authorization: `Bearer ${auth}`}
                    });
                 // window.location.reload("/")
                  dispatch({type:"CURSOR_NOT_ALLOWED_START_END"});
                 setUpdateMode(false);
        }catch(err){
             dispatch({type:"CURSOR_NOT_ALLOWED_START_END"});
            console.log(err)
        }             
}

//handle like and unlike
console.log(file)
const handleLike = async ()=>{
    try{
        const response = await axiosPrivate.patch(`/v1/posts/${path}/like`, 
            { withCredentials: true,headers:{authorization: `Bearer ${auth}`}}
        )
            setPost([response.data]);
    }catch(err){

    }
}
    return (
        <>  
        <Topbar />              
       <div className='divContainer'>
        <Sidebar />
       {
           <div className='main-container'>
        {post.map((singleItem, index)=>{
            const {_id: postId} = singleItem
            
            return(
                <>
        <div className='singlePost' key={postId}>
           <div className="singlePostWrapper" >

           <div className='postWrapper'>
           <span className='singlePostDesc'>
                   {description}
                </span>
               
               {singleItem.postPhoto && !editImageMode &&  (
                <img className='singlePostImg' 
                src={singleItem.postPhoto} alt="" />
                )}
           </div>
               
                {file && editImageMode &&  
                    <div className='edit-image-div'><img 
                        className='edit-writeImg'
                        src={URL.createObjectURL(file)} 
                         alt="" />
                    </div>
                }

               { updateMode && editImageMode &&
                    <div className="writeFormGroup">
                    <label htmlFor="fileInput">
                    <i className="writeIcon fas fa-plus"></i>
                    </label>
                    <input type="file" className='fileUpload' id='fileInput'  
                        onChange={e=> setFile(e.target.files[0])} 
                    />  
                                                             
                </div>
                }
                {updateMode && !editImageMode && <button onClick={() => setEditImageMode(true)} className='button-general-2 edit-imageBTN'>Edit Image</button>}
                 {updateMode && editImageMode && <button onClick={() => {setEditImageMode(false); }} className='button-general-2 edit-imageBTN'>Cancel</button>}
                
                {updateMode && <div><MdCancel className='cancel-edit-mode-btn' onClick={() => {setUpdateMode(false); setEditImageMode(false)}}/></div>}
                {updateMode ? <input type="text" value={title} className="singlePostTitleInput"

                     onChange={(e)=> setTitle(e.target.value)}

                 autoFocus/> : (
                    <h1 className='singlePostTitle'>
                        {title}
                        
                        {username.username === logUser?.username && 
                        <div className="singlePostEdit">
                        <i className="singlePostIcon fas fa-edit" onClick={(id)=> setUpdateMode(true)}></i>
                        <i className="singlePostIcon far fa-trash-alt" onClick={handleDelete}></i>
                        </div>//this makes the edit button only available for logged in user who owns the post
                    }
                    
                    </h1>
                 ) }

                <div className="singlePostInfo">
                    
                    <span 
                        className='singlePostAuthor'>
                            Author:  
                            <Link to={`/usersposts`} className="link">  
                                <p className='text-general-small post-title-custom-text'><b>{ username.username}</b></p>
                            </Link>
                        
                    </span>
                    <p  className='singlePostDate text-general-small'> 
                       {new Date(singleItem.createdAt).toDateString()}
                         
                    </p>
                </div>
                {/*If updatemode is true, show textarea for user to write context, if not, show p tag */}
               
                {updatePostError && <p className='paragraph-text topMargin-medium red-text'>Post Image must not be empty</p>}

               
 
               
               
           {updateMode && <button className="button-general singlePostButton" onClick={handleUpdate}>Update</button>} 
          
           </div>
           
            </div>
               
               {/*  Like button */}

               {post.postLikes}

               {!updateMode && <div className='like-icon-div padding-bottom'>
                    <AiOutlineLike className={singleItem.postLikes.includes(logUser?.userId)?'like-icon like-icon-liked':  'like-icon' }onClick={handleLike}/>
                    {singleItem.postLikes.length < 1?<p className='paragraph-text color1'>0 person liked this post</p>: singleItem.postLikes.length == 1 ? <p className='paragraph-text color3'>1 person liked this post</p>: 
                    <p className='paragraph-text color1'>{singleItem.postLikes.length} People liked this post</p>}
               </div> }

               
                
                {!updateMode && <div className="social-media-display-div social-media-text">
            
            <h4 className='text-general-small color2 share-text'>Please share this post with your friends</h4>
        </div> }
            </>
            )
        })}

       {!updateMode && <Comments/>}
  
     </div>
       
       }
       </div>
        </>

       
    )
    
}