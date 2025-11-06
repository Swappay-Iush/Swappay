import { useState } from "react";
import "./InputSearch.css"

import { CiSearch } from "react-icons/ci"; //Icono de búsqueda

//Recibimos la función setTextSearch desde la página Offers para actualizar el estado del texto de búsqueda.
const InputSearch = ({setTextSearch}) => {

    const[search, setSearch] = useState(""); //Estado que almacena el texto ingresado en el input de búsqueda.

    const handleSearch = () => { //Función que actualiza el estado del texto de búsqueda en la página Offers.
        setTextSearch(search); //Llamamos a la función pasada por props para actualizar el estado en la página Offers.
    }

    return (
       <div className="container_search">
            <CiSearch className="iconSearch"/>
            <input type="text" className="inputSearch" placeholder="Busca productos por su nombre..." onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter")handleSearch();}}/>
            <button className="buttonSearch" onClick={() => handleSearch()}>Buscar</button>
       </div>
    )
}

export default InputSearch;