import {React, useContext, useState} from 'react';
import { AuthContext } from '../context/AuthProvide';
import axios from './axios'

const AutoRefreshToken = () => {
    const { setAuth} = useContext(AuthContext);

    const refresh = async () =>{
        try{   
                const response = await axios.get(`/refreshtoken`, {
                 withCredentials: true
             });
                 setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.token);
            return { ...prev, accessToken: response.data.token }
        });
        return response.data.token;
             
        }catch(err){
            console.log(err)
        }
    }
  return refresh
}

export default AutoRefreshToken

