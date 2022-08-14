import React from 'react'
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthProvide";
import Messenger from "./pages/messenger/Messenger";
import ConfirmEmail from './pages/confirmEmail/ComfirnEmail';
import ActivationLinkSent from './pages/emailActivation/ActivationLinkSend';
import {LogContext} from './context/LogContext';
import PageLoader from "./components/pageloader/PageLoader";
import CursorNotallowed from "./pages/cursonotallowed/CursoNotAllow"
import Comment from './components/comment/Comment';
import SinglePost from './components/singlePost/SinglePost';

function App() {
	const {logUser,temp, isLoading, cursorState} = useContext(AuthContext);
	const {session} = useContext(LogContext)
  
	const [reload, setReload] = useState(false)
  
	useEffect(()=>{
	setTimeout(() => {
	  setReload(true)
	}, 500);
  }, [])
	return (
	  <Router>
		{cursorState  && <CursorNotallowed/>}
		{ (!reload || isLoading) && <PageLoader />}
			<Switch>
				{/* <Route exact path='/'>
					{user ? <Home /> : <Register />}
				</Route>
				<Route path='/login'>{user ? <Redirect to='/' /> : <Login />}</Route>
				<Route path='/register'>
					{user ? <Redirect to='/' /> : <Register />}
				</Route>
				<Route path="/messenger">
					{!user ? <Redirect to="/" /> : <Messenger />}
				</Route>
				<Route path='/profile/:username'>
					<Profile />
				</Route> */}
				<Route path="/login">
					<Login />
				</Route>
				<Route path="/register">
					<Register />
				</Route>
				<Route path="/verification/:tokenId">
         		 {temp?.emailToken ? <ConfirmEmail/>: <Login /> }
        		</Route>
        		<Route path="/linksent">
          		{temp?.emailToken ? <ActivationLinkSent/>:  <Login /> }
        		</Route>

				<Route exact path="/">
				{logUser ? <Home /> : <Login />}
				</Route>
				<Route path='/profile/:username'>
					<Profile />
				</Route> 
				<Route path='/comment'>
					<Comment />
				</Route> 
				<Route path="/post/:postId">
					<SinglePost />
                </Route>
				<Route path="/messenger">
					{!logUser ? <Redirect to="/" /> : <Messenger />}
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
