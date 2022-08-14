import React from "react";
import ReactDOM from "react-dom";
import './index.css';
import App from "./App";
import { LogContextProvider} from './context/LogContext';
import {AuthProvider} from './context/AuthProvide';

ReactDOM.render(
	<React.StrictMode>
	  < LogContextProvider>
      <AuthProvider>
        <App />
       </AuthProvider>
        </LogContextProvider>
	</React.StrictMode>,
	document.getElementById("root")
);
