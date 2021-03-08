import React,{Component} from 'react'


function Mytry(props){
    return(
        <button onClick={()=>props.onDrop({sourceSquare:"e21", targetSquare:"e5"})}></button>
    )
}

export default Mytry;