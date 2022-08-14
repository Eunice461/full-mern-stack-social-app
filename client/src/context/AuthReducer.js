const AuthReducer = (state, action) =>{
    switch(action.type){
            
        case "ISLOADING_START":
            return{
                ...state,
                isLoading: true
            };

        case "REG_SUCCESS":
            return{
                temp: action.payload,
                isLoading: false
            };
        case "LOG_SESSION":
            return{
                temp: action.payload,
            };
        case "ISLOADING_END":
            return{
                ...state,
                isLoading: false
            }
         case "CURSOR_NOT_ALLOWED_START":
            return{
                ...state,
                cursorState: true
            }

         case "CURSOR_NOT_ALLOWED_START_END":
            return{
                ...state,
                cursorState: false
            }
        case "SEARCH_STATUS_START":
                return{
                    ...state,
                   searchStatus: true
                }

         case "FOLLOW":
            return {
                ...state,
                    temp: {
                        ...state.temp,
                            followings: [...state.temp.followings, action.payload],
                    },
                };
            case "UNFOLLOW":
                return {
                    ...state,
                    temp: {
                         ...state.temp,
                            followings: state.temp.followings.filter(
                            (following) => following !== action.payload
          ),
        },
      };

            default:
                return state;
    }
};

export default AuthReducer;