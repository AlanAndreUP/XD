import "./Mensajes.css";

export default function Mensajes({data}) {
    return (
        <>
            {data.map((messageString, index) => {

               
                const message = JSON.parse(messageString);
        
                return (
                    <div className='message' key={index}>
                        {message.TEXTO}
                    </div>
                );
            })}
        </>
    );
}
