const Reducer = (state, action) =>{
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

            default:
                return state;
    }
};

export default Reducer;