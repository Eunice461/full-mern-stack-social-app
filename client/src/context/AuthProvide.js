import React from 'react'
import { createContext, useState, useEffect, useReducer } from "react";
import axios from '../hooks/axios';
import jwt_decode from 'jwt-decode';
import AuthReducer from "./AuthReducer";


const INITIAL_STATE = {
    temp: JSON.parse(localStorage.getItem("obj")) || null,
    isLoading: false,
    cursorState: false,
    searchStatus: false,
   
}

export const AuthContext = createContext({});

export const AuthProvider = ({children})=>{
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
   
    const [selectedChat, setSelectedChat] = useState();
    const [notification, setNotification] = useState([]);
    const [chats, setChats] = useState();
    const [auth, setAuth] = useState({});
    const [logUser, setLogUsers] = useState({})
    const [regUser, setRegUser] = useState({});
    
    const refreshToken = async () =>{
        try{
                const response = await axios.get(`/refreshtoken`, {
                 withCredentials: true
             });
             setAuth(response.data);   
        }
            catch(err){
                console.log(err);
            }
    };
    useEffect( async () =>{
        if(!auth?.token){
            console.log('I am running refresh token')
             refreshToken()
        }
    }, []);

const decodeJWT = ()=>{
    const decoded = jwt_decode(auth?.token);
    const newUser ={
        username: decoded.username,
        userId: decoded.userId,
        profilepicture: decoded.profilepicture,
        role: decoded.role,
        photoPublicId: decoded.photoPublicId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName
        }
    setLogUsers(newUser)
};
    
useEffect( async () =>{
        if(auth?.token){
             decodeJWT() 
        };
        
    }, [auth]);

useEffect(() => {
         if(state.temp){
             console.log('we ran')
            const decoded = jwt_decode(state.temp.emailToken);
            const newUser ={
            username: decoded.username,
            userId: decoded.userId,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName
        }
            setRegUser(newUser)
         };

    }, [])

 ///temp store user details on reg in localstorage
    useEffect(() => {
        localStorage.setItem("obj", JSON.stringify(state.temp, ));         
    }, [state.temp]);
    
//  console.log(state.temp) 
// console.log(logUser, 'hello')
// console.log(auth, "auth")
// console.log(regUser, "reg")

    return(
        <AuthContext.Provider value={{
            auth, 
            setAuth,
            logUser,
            setLogUsers,
            regUser,
            setRegUser,
            temp: state.temp,
            selectedChat,
            setSelectedChat,
            notification,
            setNotification,
            chats,
            setChats, 
            isLoading: state.isLoading, 
            dispatch,  
            cursorState: state.cursorState,
            searchStatus: state. searchStatus,
        }}>
            {children}
        </AuthContext.Provider>
    )


};