document.addEventListener('DOMContentLoaded', () => {
    const estado = {
        contenedorEvolucion: document.querySelector('.containerEvolution'),
        botonEvolucion: document.querySelector('.buttonEvolution'),
        descripcionPokemon: document.querySelector('.pokemonDescrition'),
        habilidadesPokemon: document.querySelector('.pokemonAbilities'),
        contenedorInformacion: document.querySelector('.containerInfo'),
        nombrePokemon: document.querySelector('.pokemonName'),
        botonBuscar: document.querySelector('.buttonSearch'),
        entradaPokemon: document.getElementById('in1'),
        contenedorError: document.querySelector('.containerError'),
        imagenPokemon: document.querySelector('.pokemonImg'),
        tipoPokemon: document.querySelector('.pokemonType'),
        siguienteEvolucion: ''
    };

    estado.botonBuscar.addEventListener('click', () => {
        const nombrePokemon = estado.entradaPokemon.value.trim().toLowerCase();
      
        if (nombrePokemon === '') {
            mostrarError('Ingrese el nombre de un Pokémon');
            return;
        }
  
        obtenerDatosPokemon(nombrePokemon)
            .then((datosPokemon) => {
                mostrarInfoPokemon(datosPokemon);
            })
            .catch((error) => {
                console.error("Vaya! algo salió mal. Es posible que el nombre de tu Pokémon esté mal escrito. Por favor revisa e intenta nuevamente.", error);
                mostrarError('Vaya! algo salió mal. Es posible que el nombre de tu Pokémon esté mal escrito. Por favor revisa e intenta nuevamente.');
            });
    });

    const obtenerDatosEspecie = (urlEspecie) => axios.get(urlEspecie)
        .then((respuesta) => respuesta.data)
        .catch((error) => {
            console.error("Not founded", error);
            throw new Error('Not founded');
        });

    const obtenerDatosPokemon = (nombre) => axios.get(`https://pokeapi.co/api/v2/pokemon/${nombre}`)
        .then((respuesta) => {
            const datosPokemon = respuesta.data;
            const urlEspecie = datosPokemon.species.url;
            return { ...datosPokemon, urlEspecie };
        })
        .catch((error) => {
            console.error("Not founded", error);
            throw new Error('Not founded');
        });

    const obtenerDatosCadenaEvolucion = (urlCadenaEvolucion) => axios.get(urlCadenaEvolucion)
        .then((respuesta) => respuesta.data)
        .catch((error) => {
            console.error("Not founded", error);
            throw new Error('Not founded');
        });

    const mostrarInfoPokemon = (datosPokemon) => {
        estado.nombrePokemon.textContent = capitalizarPrimeraLetra(datosPokemon.name);
        estado.imagenPokemon.src = datosPokemon.sprites.front_default || '';
        estado.tipoPokemon.textContent = datosPokemon.types.map(tipo => tipo.type.name).join(', ');
        estado.habilidadesPokemon.textContent = datosPokemon.abilities.map(habilidad => habilidad.ability.name).join(', ');
  
        const urlEspecie = datosPokemon.urlEspecie;
  
        obtenerDatosEspecie(urlEspecie)
            .then((datosEspecie) => {
                const entradasTextoSabor = datosEspecie.flavor_text_entries.filter(entrada => entrada.language.name === 'es');
        
                if (entradasTextoSabor.length > 0) {
                    estado.descripcionPokemon.textContent = entradasTextoSabor[0].flavor_text;
                }
                if (datosEspecie.evolution_chain.url) {
                    const urlCadenaEvolucion = datosEspecie.evolution_chain.url;
                    return obtenerDatosCadenaEvolucion(urlCadenaEvolucion);
                } 
            })
            .then((datosCadenaEvolucion) => {
                if (tieneEvolucionSiguiente(datosCadenaEvolucion, datosPokemon.species.name)) {
                    estado.contenedorEvolucion.style.display = 'flex';
                    estado.siguienteEvolucion = encontrarSiguienteEvolucion(datosCadenaEvolucion.chain, datosPokemon.species.name);
                } 
                else {
                    estado.contenedorEvolucion.style.display = 'none';
                    estado.siguienteEvolucion = '';
                }
            })
  
        estado.contenedorInformacion.style.display = 'flex';
        estado.contenedorError.style.display = 'none';
    };

    const mostrarError = (mensaje) => {
        estado.contenedorError.querySelector('p').textContent = mensaje;
        estado.contenedorError.style.display = 'flex';
        estado.contenedorInformacion.style.display = 'none';
    };

    const capitalizarPrimeraLetra = (cadena) => cadena.charAt(0).toUpperCase() + cadena.slice(1);
    const tieneEvolucionSiguiente = (datosCadenaEvolucion, nombreEspecie) => {
        const recorrerCadena = (cadena) => {
            if (cadena.species.name === nombreEspecie) {
                if (cadena.evolves_to && cadena.evolves_to.length > 0) {
                    return true; 
                } else {
                    return false; 
                }
            } else {
                if (cadena.evolves_to && cadena.evolves_to.length > 0) {
                    for (let i = 0; i < cadena.evolves_to.length; i++) {
                        if (recorrerCadena(cadena.evolves_to[i])) {
                            return true; 
                        }
                    }
                }
            }
            return false; 
        };
        return recorrerCadena(datosCadenaEvolucion.chain);
    };
    
    const encontrarSiguienteEvolucion = (cadena, nombreEspecieActual) => {
        const recorrerCadena = (cadena) => {
            if (cadena.species.name === nombreEspecieActual) {
                if (cadena.evolves_to.length > 0) {
                    return cadena.evolves_to[0].species.name; 
                }
            } else {
                for (let i = 0; i < cadena.evolves_to.length; i++) {
                    const siguienteEvolucion = recorrerCadena(cadena.evolves_to[i]);
                    if (siguienteEvolucion) {
                        return siguienteEvolucion;
                    }
                }
            }
            return null;
        };   
        return recorrerCadena(cadena);
    };

    estado.botonEvolucion.addEventListener('click', () => {
        obtenerDatosPokemon(estado.siguienteEvolucion)
            .then((datosPokemon) => {
                mostrarInfoPokemon(datosPokemon);
            })
            .catch((error) => {
                console.error("Vaya! algo salió mal. Es posible que el nombre de tu Pokémon esté mal escrito. Por favor revisa e intenta nuevamente.", error);
                mostrarError('Vaya! algo salió mal. Es posible que el nombre de tu Pokémon esté mal escrito. Por favor revisa e intenta nuevamente.');
            });
    });
});

