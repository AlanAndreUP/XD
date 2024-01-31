"use client"

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import "./inicio.css"
import { Card_B } from '../../components/Cards';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import Chat from './chatbot/page';
config.autoAddCss = false;

export default function Home(){
    return(
        <>
            <Navbar />
            <main>
                <Chat/>     
            </main>
        
        </>
    )
}