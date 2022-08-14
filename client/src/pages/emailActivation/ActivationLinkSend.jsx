import './emailgeneral.css';
import React, { useContext } from 'react';
import {MdOutlineMail} from 'react-icons/md';
//import {Context} from '../../context/Context';
import {FaCheckSquare} from 'react-icons/fa';
import {AuthContext} from '../../context/AuthProvide';

function ActivationLinkSent() {
    const {temp, regUser} = useContext(AuthContext)

  return (
    <>
    <article className='mainWrapper'>
    <div className='mainContainer flex' >
        <div className='email-div'>
             <div className='md-div'><MdOutlineMail className='emailIcon2'/></div>
            <h2 className='text-general-small2 color1 margin-small'>
                Email activation link sent
        </h2>
        <p className='paragraph-text '>
            Hello {regUser.username}, An activation email was sent to your email address.
                Kindly check your email inbox or spam box, click
                the activation link to activate your account.
        </p>
        <FaCheckSquare className='Icon'/>
        <h3 className='verifyText2'>
            Social Media App
        </h3>
        </div> 
    </div>
    </article>
    </>
  )
}

export default ActivationLinkSent