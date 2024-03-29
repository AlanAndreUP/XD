"use client"

import "./Navbar.css"
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { useEffect,useState } from "react";
import { getAuthData, clearAuthData } from "../Token"
import Link from "next/link"

config.autoAddCss = false;

export default function Navbar() {
    const authData = getAuthData();
    const [getUser, setUser] = useState(false);
    const [menu, setMenu] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [usuario, setUsuario] = useState({
      nombre: "",
      apellidos: "",
      telefono: "",
      correo: "",
      municipio: "",
      estado: "",
      password: ""
    });
  
    useEffect(() => {
      if (authData.userId) {
        fetch("http://localhost:3002/ALL/"+authData.userId, {
          headers: {
            Authorization: `${authData.token}`,
            "Content-Type": "application/json"
          }
        })
          .then(response => response.json())
          .then(data => {
            if (data.error) {

            } else {
              setUser(true);
              setUsuario({
                nombre: data.nombre,
                apellidos: data.apellidos,
                telefono: data.telefono,
                correo: data.correo,
                municipio: data.municipio,
                estado: data.estado,
                password: data.password
              });
            }
          })
          .catch(error => {
            console.error("Error al obtener datos:", error);
          });
      }
    }, [authData.userId]);
  
    const handleMenuClick = () => {
      setMenu(!menu);
    };
  
    const handleLogout = () => {
    
      setMenu(!menu);
    };
    useEffect(() => {
      const intervalId = setInterval(async () => {
          try {
              const response = await fetch('http://localhost:3002/active-users');
              if (response.ok) {
                  const data = await response.json();
                  setUsuarios(data); // Asegúrate de que data es un array de objetos con { id, connected }
              } else {
                  throw new Error('Respuesta de red no fue ok.');
              }
          } catch (error) {
              console.error('Error al obtener los datos', error);
          }
      }, 5000);

      return () => clearInterval(intervalId);
  }, []);
  const handleNotificationClick = (userId) => {
    const checkUserConnection = async () => {
        try {
            const response = await fetch(`http://localhost:3002/user-status/${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (!data.connected) {
                 
                    alert(`El usuario ${userId} se ha desconectado.`);
                } else {
              
                    setTimeout(checkUserConnection, 5000);
                }
            } else {
                throw new Error('Respuesta de red no fue ok.');
            }
        } catch (error) {
            console.error('Error al verificar el estado del usuario', error);
        }
    };

    checkUserConnection();
};

  
    return (
      <header>
        <nav>
          <div className="logoContenedor">
            <a href="/" onClick={handleMenuClick}>
              <img src="/oo.png" alt="" />
              <h4>Psicopedagogía</h4>
            </a>
            <FontAwesomeIcon
              icon={faBars}
              className={menu ? "btn-bars" : "btn-bars-active"}
              onClick={handleMenuClick}
            />
          </div>
          <ul className={menu ? "nav-lista" : "menu-open"}>
            <li>
              <img src="/oo.png" alt="" onClick={() => {window.location="/"}} />
            </li>
            {!getUser ? (
              <>
                <li>
                  <p>Cuenta anónima<br />Para continuar, inicie sesión.</p>
                </li>
                <li>
                  <a
                    href="/Login"
                    className="menu"
                    onClick={handleMenuClick}
                  >
                    Iniciar sesión
                  </a>
                </li>
                <li>
                  <p>O bien, cree una nueva cuenta</p>
                </li>
                <li>
                  <a
                    href="/Registro"
                    className="menu"
                    onClick={handleMenuClick}
                  >
                    Registrarse
                  </a>
                </li>
                <li id="chatbot">
                  {menu ? (
                    <a id='chatbotBtn'>
                      <FontAwesomeIcon icon={faCommentDots} />
                    </a> 
                  ) : (
                    <Link href="/chatbot" id='chatbotBtn' onClick={handleMenuClick}>
                      <FontAwesomeIcon icon={faCommentDots} />
                    </Link>
                  )}    
                </li>
              </>
            ) : (
              <>
                <li>
                  <p className="user">
                    {usuario.nombre} <br />{usuario.apellidos}
                  </p>
                </li>
                <ul>
    {usuarios.map((usuario, index) => (
        <li key={index} className={usuario.connected ? "conectado" : "desconectado"}>
            <p>{usuario.userName}</p>
            {usuario.connected && (
                <button onClick={() => handleNotificationClick(usuario.userId)}>Notificar</button>
            )}
        </li>
    ))}
</ul>

                <li>
                  <a
                    href="/"
                    className="menu"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </a>
                </li>
                
              </>
            )}
          </ul>
        </nav>
      </header>
    );
  }