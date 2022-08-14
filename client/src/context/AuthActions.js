export const RegSucess = (temp) => ({
    type: "REG_SUCCESS", 
    payload: temp  
});

export const LoginSession = (temp) => ({
    type: "LOG_SESSION", 
    payload: temp
});

export const isLoadingStart = () => ({
    type: "ISLOADING_START", 
    
});
export const IsLoadingEnd = () => ({
    type: "ISLOADING_END", 
    
});
export const Follow = (userId) => ({
    type: "FOLLOW",
    payload: userId,
  });
  
  export const Unfollow = (userId) => ({
    type: "UNFOLLOW",
    payload: userId,
  });