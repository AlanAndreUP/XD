import React, { useState, useEffect, Suspense } from 'react';
import "./Chatbot.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Mensajes from './components/Mensajes';
import { saveAuthData, getAuthData, clearAuthData } from "../../../Token"

export default function Chatbot() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [messageBuffer, setMessageBuffer] = useState([]);

    const authData = getAuthData(); 

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);
    const flushMessageBuffer = () => {
        console.log(messageBuffer);
        
        setMessageBuffer([]); 
    };
    const connectWebSocket = () => {
        const newSocket = new WebSocket("ws://localhost:3002");
       
        newSocket.onopen = () => {
            console.log("Conexión WebSocket abierta");
            messageBuffer.forEach((message) => {

                newSocket.send(message);

        });
            setSocket(newSocket);
        
            
        };
      
        newSocket.onmessage = (event) => {
            if (typeof event.data === 'string') {
               
                setMessages(prev => [...prev, event.data]);
               
            }
        };
        newSocket.onerror = (event) => console.error("Error en WebSocket", event);
        newSocket.onclose = (event) => {
            console.log("Conexión WebSocket cerrada", event);
            setTimeout(connectWebSocket, 3000); 
        };
    };
 
    const sendMessage = () => {
        const messageToSend = JSON.stringify({ userId: authData.userId, text: inputMessage });
        if (socket && socket.readyState === WebSocket.OPEN && inputMessage ) {
            console.log(authData);
          
            socket.send(messageToSend);

            
        }
        else{
         
            setMessageBuffer(prevBuffer => [...prevBuffer, messageToSend]);
            console.log(messageBuffer);
        }
        
        setInputMessage('');
        setTimeout(() => {
            const scroll = document.getElementById('scroll');
            if (scroll) {
                scroll.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 200);
    };

    // Verifica si el usuario está autenticado (tiene un ID) y si el socket está abierto
    const isInputEnabled = socket && socket.readyState === WebSocket.OPEN && authData?.userId;

    return (
        <>
            <main>
                <div className="cabeceraChat">
                    <h2>Chat Global.</h2>
                </div>

                <div className="contenedorChat">
                    <Suspense fallback={<div id='cargando'><FontAwesomeIcon icon={faSpinner} /></div>}>
                        <Mensajes data={messages} />
                    </Suspense>
                    <span id="scroll" />
                </div>

                <div className="pieChat">
                    <div className="contenedorInput">
                        <input 
                            type="text" 
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Escribe un mensaje..."
                            
                        />
                        <span>
                            <FontAwesomeIcon icon={faPaperPlane} onClick={sendMessage} />
                        </span>
                    </div>
                </div>
            </main>
        </>
    );
}
