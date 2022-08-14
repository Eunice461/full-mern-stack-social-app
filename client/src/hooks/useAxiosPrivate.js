import axiosPrivate from "./AxiosPrivate";
import { useEffect, useContext } from "react";
import AutoRefreshToken from "./AutoRefresheToken";
import {AuthContext} from '../context/AuthProvide';

const useAxiosPrivate = () =>{
    const refresh = AutoRefreshToken();
    const { auth } = useContext(AuthContext);

    useEffect(() =>{
        const requestInterceptors = axiosPrivate.interceptors.request.use(
            config =>{
                if(!config.headers['authorization']){
                    config.headers['authorization'] = `bearer ${auth?.token}`
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error)=>{
                const prevRequest = error?.config;
                if(error?.response?.status === 403 && !prevRequest?.sent){
                    prevRequest.sent = true;
                    const newAccessToken = await refresh()
                    console.log(newAccessToken.token)
                     prevRequest.headers['authorization'] = `bearer ${newAccessToken}`;
                     console.log(auth)
                     return axiosPrivate(prevRequest);
                    
                   
                }
                return Promise.reject(error);
            }
        );

        return()=>{
            axiosPrivate.interceptors.request.eject(requestInterceptors)
            axiosPrivate.interceptors.response.eject(responseIntercept)
        }

    }, [auth, refresh])
   
    return axiosPrivate;
};


export default useAxiosPrivate;