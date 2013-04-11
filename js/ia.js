/*******************************************************************
 * 
 * Clase IA
 * 
 *******************************************************************
*/ 
	IA.prototype = new Jugador();

	IA.prototype.constructor = IA;


	function IA () {
		this.esHumano =  false;
		this.estrategiaDeJuego = null;
	}

	//------------------------------------------------------------------
    // Clasifica una carta en baja, media, alta 
    //------------------------------------------------------------------

	IA.prototype.clasificar  = function(carta){
				if (carta.valor <= 6 )
					return 0;
				else if (carta.valor  <= 10)
					return 1;
				else
					return 2;
	}

	//------------------------------------------------------------------
	//  Elige la carta mas baja o la mas alta segun los datos 
	//------------------------------------------------------------------
	// El tercer argumento sirve para elegir una carta de cierta clisificacion
	// 0 - Baja
	// 1 - Media
	// 2 - Alta
	IA.prototype.elegir  =  function ( orden , carta , claseC) {
		var indice = -1;
		if (carta === undefined) carta = null;
		var valor = (orden === 0) ? 99 : (carta === null ? -1: 99) ;

		for ( var c in this.cartasEnMano ) {
			var v_act = this.cartasEnMano[c].valor;
			var ctipo = this.clasificar(this.cartasEnMano[c]);
			if ( claseC !== undefined &&  claseC !==  ctipo ) continue;
			switch (orden) {
				case 0://busca la carta mas chica
					if ( v_act < valor ) {valor = v_act ; indice = c; }
					break;
				case 1:
					if (carta === null) {//busca la mas grande
						if ( v_act > valor ) {valor = v_act ; indice = c; } 
					} 
					else {//busca la mas chica que mate lo que jugo el otro
						if ( v_act < valor && v_act > carta.valor  ) {valor = v_act ; indice = c; } 
					}
					break;
			}
		}

		return indice;
	}
   
   //------------------------------------------------------------------
   // LLeva estadistica de los cantos del humano
   //------------------------------------------------------------------
    
    IA.prototype.statsEnvido = function(cantos, quienCanto, puntos){
        if (cantos !== undefined && cantos !== null)
            for(var i in cantos){
                if (quienCanto[i] === 'H')
                    switch (cantos[i]){
                        case 'E':
                            this.envidoS.push(puntos);
                            break;
                        case 'EE':
                            this.revire.push(puntos);
                            break;
                        case 'R':
                            this.realEnvido.push(puntos);
                            break;
                        case 'F':
                            this.faltaEnvido.push(puntos);
                            break;
                    }
            }
        return;
    }
    
    
	//------------------------------------------------------------------
	//  Determina si gane un determinado numero de mano
	//------------------------------------------------------------------
	
    IA.prototype.gane = function(nroMano){
        var e1 = _rondaActual.equipoPrimero;
        var e2 = _rondaActual.equipoSegundo;
        
        return (e2.jugador.cartasJugadas[nroMano].valor - e1.jugador.cartasJugadas[nroMano].valor);
    }
    
	//------------------------------------------------------------------
    // Clasifica las cartas en baja, media, alta
    //------------------------------------------------------------------	

    IA.prototype.clasificarCartas = function(cartas){
        var media = 0, alta = 0, baja = 0;
        
        for(var i = 0; i < cartas.length; i++)
            if (cartas[i].valor <= 6 )
                baja++;
            else if (cartas[i].valor  <= 10)
                media++;
            else
                alta++;
        return {alta:alta, media:media, baja:baja};
    }

	//---------------------------------------------------------------
	//Devuelve el indice de la carta en mano con menor valor capaz de matar .
	//la carta pasada por argumento. Si no la puede matar, devuelve -1
	//---------------------------------------------------------------    
	IA.prototype.laMato = function (carta)
	{
		var indice = -1, valor = 99;
		
		for(var i = 0; i < this.cartasEnMano.length; i++)
			if(carta.valor < this.cartasEnMano[i].valor)
				if(this.cartasEnMano[i].valor < valor){
					valor = this.cartasEnMano[i].valor;
					indice = i;
				}
		return indice;
	}

	//------------------------------------------------------------------
    // Determina si tengo una carta mas baja 
    //------------------------------------------------------------------

	IA.prototype.masBaja = function (carta)
	{
		for(var i = 0; i < this.cartasEnMano.length; i++)
			if(carta.valor > this.cartasEnMano[i].valor)
				return true;
		return false;
	}
	
	//------------------------------------------------------------------
    // Evalua el canto
    //------------------------------------------------------------------

	IA.prototype.ptoEnJuego = function (ultimo) {
		switch(ultimo){  
			case 'T' : 
				return {now:2 , next: 'RT' , pnext : 3 } ;
			case 'RT':
				return {now:3 , next: 'V' , pnext : 4 };
			case 'V':
				return {now:4 , next: '' , pnext : 4  };
			default:	
				return {now:1 , next: 'T' , pnext : 2  };
		}		
	}
	
	//------------------------------------------------------------------
    // Determina el canto del truco (muy larga la funcion jeje ) 
    //------------------------------------------------------------------

IA.prototype.truco = function (resp , ultimo) {
	var e1 = _rondaActual.equipoPrimero;
    var e2 = _rondaActual.equipoSegundo;
    var nroMano = _rondaActual.numeroDeMano;
    var posiblesCartas = (_rondaActual.puntosGuardados !== null) ?
        e2.jugador.prob.deducirCarta(_rondaActual.puntosGuardados, e1.jugador.cartasJugadas) : null;
        
    if (posiblesCartas !== null )   // Ordeno segun valor. La mas alta queda primera
		posiblesCartas = posiblesCartas.sort(function(a,b){return b.valor - a.valor}) ;

    var enMano = e2.jugador.cartasEnMano;
    var miMesa = (e2.jugador.cartasJugadas.length === nroMano + 1 ) ?  e2.jugador.cartasJugadas[nroMano]  : null ;
    var suMesa = (e1.jugador.cartasJugadas.length === nroMano + 1 ) ?  e1.jugador.cartasJugadas[nroMano]  : null ;
    var clasif = this.clasificarCartas(this.cartasEnMano);
    // Tener en cuenta la carta que jugue
	var mediaalta = clasif.alta + clasif.media;
	
	var p1 =  e1.puntos; 
	var p2 =  e2.puntos;
	var diff = p2 - p1;
	var loQueFalta = limitePuntaje - ((p1 > p2) ? p1 : p2);
	var t = this.ptoEnJuego(ultimo);
	
    if (resp) {  // Me cantaron, tengo que responder
        switch(nroMano){
            case 0:
				var ran = getRandomInt(0,100);
				switch(ultimo){
					case 'T':
						if (e2.jugador.puntosGanadosEnvido < 2 && (mediaalta) >= 2 && clasif.alta >= 1)
							return 'S';
						if (clasif.baja === 3 && ran <= 50) return 'RT'; //esto no deberia pasar siempre
						if (mediaalta >= 2 && diff < 0  ) return 'RT';    // Te trato de correr
						if (mediaalta >= 1 && diff > 0  ) return 'S';
						return ( ran < 66 ? 'N' : 'S' );                  //  (*) Rompe con la reglas staticas
					case 'RT':
					case 'V':
						if (clasif.alta >= 2) return 'S';
						if ((mediaalta) >= 2  && diff > 3 ) return 'S';
						if (e2.jugador.puntosGanadosEnvido >= 2) return 'N';
						return 'N';
					break;
				}
            case 1:
                if(this.gane(0) > 0){//si tengo primera
					if(miMesa === null){//todavia no jugue -> el humano tampoco, estoy en un retruque
						switch(ultimo){
							case 'RT':
								if(mediaalta >= 1)
									return (clasif.alta >= 1 ? 'V' : 'S');
								else if (clasif.baja === 1 && clasif.media === 1)
									return 'S';
								else
									return 'N';
							case 'V':
								if(mediaalta >= 1)
									return 'S';
								return 'N';
						}
					} 
					else{//ya jugue, el humano no
						switch(ultimo){//a rellenar
							case 'T':
								//si me la re banco en 3ra le retruco
								if(this.cartasEnMano[0].valor >= 11)
									return 'RT';
								//sino, veo que jugue y que me queda
								if(miMesa.valor >= 11)
									return 'RT';
								if(miMesa.valor >= 7){
									if(this.cartasEnMano[0].valor >= 10)
										return 'RT';
									else
										return 'S';
								}
								else{//jugue menos de un 12 en segunda
									var ran = getRandomInt(0,100);
									if(this.cartasEnMano[0].valor >= 6){
										if(this.puntosGanadosEnvido >= 3 && ran <= 66)//si gane bastante en el envido me quedo con
											return 'N';                               //el 3x1 en la mayoria de los casos
										else
											return 'S';
									}
								}
								return 'N';
							case 'RT':
								//si me la re banco en 3ra le retruco
								if(this.cartasEnMano[0].valor >= 11)
									return 'V';
								//sino, veo que jugue y que me queda
								if(miMesa.valor >= 11)
									return 'V';
								if(miMesa.valor >= 9)//jugue entre un 2 y un 3 en segunda
									return 'S';
								if(miMesa.valor >= 6)//jugue entre un 11 y un ancho falso en segunda
									if(this.cartasEnMano[0].valor >= 9)
										return 'S';
								//jugue de un 11 para abajo en segunda
								if(this.cartasEnMano[0].valor >= 9)
									return 'S';
								else
									return 'N';
								return 'N';
							case 'V':
								//si me la re banco en 3ra le doy el quiero
								if(this.cartasEnMano[0].valor >= 11)
									return 'S';
								if(miMesa.valor >= 11)
									return 'S';
								if(miMesa.valor >= 9)//jugue entre un 2 y un 3 en segunda
									return 'S';
								if(miMesa.valor >= 6)//jugue entre un 11 y un ancho falso en segunda
									if(this.cartasEnMano[0].valor >= 9)
										return 'S';
								if(this.cartasEnMano[0].valor >= 9)	//jugue de un 11 para abajo en segunda
									return 'S';
								else
									return 'N';
								return 'N';
						}
					}
					
					
				} 
				else if ( this.gane(0)  === 0 ) {  // Pardamos primeraaa  y Me cantoooooo
						if (suMesa === null && posiblesCartas !== null) suMesa = posiblesCartas[0];  // No es lo ideal en todos los casos. 
						
						if (miMesa !== null && miMesa.valor < 8) return 'N';               // me retruco a una carta baja
						if (suMesa !==  null && this.laMato(suMesa) === -1 ) return 'N';   // Vi su carta y pierdo
						switch(ultimo){//a rellenar
							case 'T':
								if (suMesa !==  null && this.laMato(suMesa) > -1 ) return 'RT';   // si gano retruco
								if(mediaalta > 0)
									return 'S';
								return 'N';
							case 'RT':
								if (suMesa !==  null && this.laMato(suMesa) > -1 ) return 'V';    // si gano retruco
								if (miMesa !== null && miMesa.valor >= 11) return 'S';
								if (miMesa !== null && miMesa.valor >= 13) return 'V';
								if(clasif.alta > 0) return 'S';
								return 'N'
							case 'V':
								if (miMesa !== null && miMesa.valor >= 11) return 'S';
								if(clasif.alta > 0)	return 'S';
								return 'N';
						}
					
				}
				else{//perdi primera
					if(suMesa === null){//no se tiro ninguna carta en la segunda todavia
						switch(ultimo){//a rellenar
							case 'T':
								if(mediaalta === 2)
									return 'S';
								return 'N';
							case 'RT':
								if(clasif.alta === 2)
									return 'S';
								return 'N'
							case 'V':

								if(clasif.alta === 2)
									return 'S';
								return 'N';
						}
					}
					else{//el humano ya jugo. Estoy en medio de un retruque
						var mato = this.laMato(suMesa);
						switch(ultimo){//a rellenar
							case 'RT'://por ahora hago lo mismo que en vale4
							case 'V':
								if(mato === -1)
									return 'N';
								if(clasif.alta === 2)
									return (ultimo === 'V') ? 'S' : 'V';
								if(this.clasificar(this.cartasEnMano[1 - mato]) >= 1)
									return 'S';
								return 'N';
							}
					}
				}
				return 'N';
				break;
            case 2:
                if(this.gane(1) > 0){//perdi primera, gane segunda
					if(miMesa === null){//todavia no jugue, me esta retrucando
						switch(ultimo){
							case 'RT':
								if(this.cartasEnMano[0].valor >= 13)
									return 'V';
								if(this.cartasEnMano[0].valor >= 11)
									return 'S';
								return 'N';
							case 'V':
								if(this.cartasEnMano[0].valor >= 13)
									return 'S';
								return 'N';
						}

					}  
					else{//ya jugue, el humano no
						switch(ultimo){//a rellenar
							case 'T':
								var ran = getRandomInt(0,100);
								if(posiblesCartas !== undefined && posiblesCartas !== null){
									if(posiblesCartas.length > 0 && posiblesCartas[0].valor < miMesa.valor)
										return 'S';
									else
										return 'N'
									}
								if(miMesa.valor >= 12)
									return 'RT';
								if(miMesa.valor >= 9)
									return 'S';
								if(miMesa.valor >= 6){//si tengo entre un 12 y un ancho falso
									if(this.puntosGanadosEnvido >= 3)//3x1 negocio
										return 'N';
									else if(ran <= 33)
										return 'S';
								}
								return 'N';
							case 'RT':
								var ran = getRandomInt(0,100);
								if(miMesa.valor >= 13)
									return 'V';
								if(miMesa.valor >= 9) //con un 2 le doy
									return 'S';
								if(miMesa.valor >= 6){//si tengo entre un 12 y un ancho falso
									if(this.puntosGanadosEnvido >= 3)//3x2 negocio
										return 'N';
									else if(ran <= 33)
										return 'S';
								}
								return 'N';
							case 'V':
								if(miMesa.valor >= 13) return 'S'; 
								
								else return 'N';  // Me cantan y ya vieron mis cartas!! 
						}
					}
				} 
				else if (this.gane(1) === 0 ) {  // Si o si Doble parda
						if (suMesa === null && posiblesCartas !== null) suMesa = posiblesCartas[0];  // No es lo ideal en todos los casos. 
						
						if (miMesa !== null && miMesa.valor < 8) return 'N';               // me retruco a una carta baja
						if (suMesa !==  null && this.laMato(suMesa) === -1 ) return 'N';   // Vi su carta y pierdo
						switch(ultimo){//a rellenar
							case 'T':
								if (suMesa !==  null && this.laMato(suMesa) > -1 ) return 'RT';   // si gano retruco
								if(mediaalta > 0)
									return 'S';
								return 'N';
							case 'RT':
								if (suMesa !==  null && this.laMato(suMesa) > -1 ) return 'V';    // si gano retruco
								if(clasif.alta > 0)
									return 'S';
								return 'N'
							case 'V':
								if(clasif.alta > 0)
									return 'S';
								return 'N';
						}
						
				}		
				else{//gane primera, perdi segunda
					if(suMesa === null){//el humano no jugo todavia
						switch(ultimo){
							case 'T':
								if(posiblesCartas !== null && posiblesCartas !== undefined)
									if(posiblesCartas.length > 0 && posiblesCartas[0].valor <= this.cartasEnMano[0].valor)
										return 'RT';
								if(this.cartasEnMano[0].valor >= 11)
									return 'RT';
								if(this.cartasEnMano[0].valor >= 9)
									return 'S';
								if(this.cartasEnMano[0].valor >= 7){
									if(this.puntosGanadosEnvido >= 3)//3x1 negocio
										return 'N';
									else {//pequenia heuristica: si le costo mucho matar una carta media baja me la juego porque tiene algo mas
										if((this.cartasJugadas[0].valor - e1.jugador.cartasJugadas[0].valor > 3) && e1.jugador.cartasJugadas[0].valor > 7)
											return 'N';
										else
											return 'S';
									}
								}
								return 'N';
							case 'RT':
								var ran = getRandomInt(0,100);
								if(this.cartasEnMano[0].valor >= 13)
									return 'V';
								if(this.cartasEnMano[0].valor >= 11)
									return 'S';
								if(this.cartasEnMano[0].valor >= 8) //tengo un 2 o un 3 por ahora doy el quiero
									return 'S';
								if(this.cartasEnMano[0].valor >= 7){
									if(this.puntosGanadosEnvido >= 3)//3x2 negocio
										return 'N';
									else {//pequenia heuristica: si le costo mucho matar una carta media baja
									      // 2/3 de las vecesme la juego porque tiene algo mas
										if((this.cartasJugadas[0].valor - e1.jugador.cartasJugadas[0].valor > 3) && e1.jugador.cartasJugadas[0].valor > 7)
											if(ran <= 66) return 'N'; 
											else return 'S';
									}
								}
								
								return 'N';
							case 'V':
								if(this.cartasEnMano[0].valor >= 11)
									return 'S';
								
								return 'N';
						}
						
					}
					else{//el humano ya jugo, yo le cante y me retruco
						switch(ultimo){
							case 'RT':
								if(this.cartasEnMano[0].valor > suMesa.valor)
									return 'V';
								return 'N';
							case 'V':
								if(this.cartasEnMano[0].valor > suMesa.valor)
									return 'S';
								return 'N';
						}
					}
				}
        }
	}
	else if (ultimo === null || ultimo === undefined){//todavia no se canto nada
		var mato = null;
		switch(nroMano){
			case 0:
				if (mediaalta >= 3) return 'T'; // Estoy re armado  (o eso pienso)
				return '';
				
			case 1:
				if (this.gane(0) > 0){ //gane primera, el humano todavia no jugo la segunda carta
					this.estrategiaDeJuego = this.estrategia1;
					
					if (clasif.alta === 2) return 'T';
					if (mediaalta === 2)   return 'T';
					
					if (clasif.baja === 1 && clasif.alta === 1)//juego callado y espero a 3era
						return '';
					if (clasif.alta >= 1) return 'T'; 
					return '';
					
				}
				else if (this.gane(0) === 0 ) {  // Parda en primera (No juegue todavia)   
					//if (suMesa === null && posiblesCartas !== null) suMesa = posiblesCartas[0];  // No es lo ideal en todos los casos. 
					if (suMesa !==  null && this.laMato(suMesa) > -1 )   return 'T';  
					if (suMesa !==  null &&  suMesa.valor <= 7 ) return 'T';       
					if (mediaalta > 0 ) return 'T';
					return '';
				} 
				else {//perdi primera, el humano ya jugo
					if(this.laMato(suMesa) !== -1 ){
						if(clasif.alta === 2)
							return 'T';
						if(mediaalta >= 1)
							return '';
						return '';
					}
					else{
						if(posiblesCartas !== null && suMesa.valor <= 4 && posiblesCartas.length > 0 && posiblesCartas[0].valor <= 6)
							return 'T';   // Para asustar nomas porque ya perdi (*)
						return '';
					}
				}
				break;
			case 2:
				var ran = getRandomInt(0,100);
				if (this.gane(1) < 0){//gane primera, perdi segunda, el humano ya jugo
					if(this.laMato(suMesa) !== -1)
						return 'T';
					if(posiblesCartas !== null && posiblesCartas.length > 0 && this.laMato(posiblesCartas[0]) !== -1)
						return 'T';
					if(ran <= 33 && suMesa.valor < 8)//si tiene menos de un 1 le canto
						return 'T';       /*  Esto no estaria bueno que pase siempre   (?)  */ 
					return '';	
					
				} 
				else if ( this.gane(1) === 0)  { // Doble parda
					if (suMesa !==  null && this.laMato(suMesa) > -1 ) return 'T';  
					if (suMesa !==  null &&  suMesa.valor <= 7 ) return 'T';      
					if (mediaalta > 0 ) return 'T';
					return '';
					
				}
				else{//perdi primera, gane segunda, el humano no jugo todavia
					if (this.cartasEnMano[0].valor >= 10) return 'T'; 
					if(posiblesCartas !== null && posiblesCartas.length > 0 && this.laMato(posiblesCartas[0]) !== -1)
						return 'T';
					else (posiblesCartas !== null && posiblesCartas.length > 0 && this.laMato(posiblesCartas[0]) === -1)
						return '';
					return '';
				}
		}
	}
	else{ //tengo el quiero
		switch(nroMano){
			case 0://habria que hacer mas analisis en esta rama
					if(suMesa !== null){//el humanoide ya jugo
						var mato = this.laMato(suMesa);
						switch(ultimo){
							case 'T':
								//var mato = this.laMato(suMesa);
								if(mato !== -1){
									if(clasif.alta === 2)
										return 'RT';
									else
										return '';
								}
								else{
									return '';
								}
							case 'RT':
								if(mato !== -1){
									if(clasif.alta === 2)
										return 'V';
									else
										return '';
								}
								else{
									return '';
								}
							default://creo que nunca deberia llegar aca
								return '';
						}
					}
					else{//soy mano, todavia no jugo nadie
						switch(ultimo){
							case 'RT':
								if(clasif.alta  >= 2)
									return 'V';
								if(mediaalta >= 2)
									return '';
							default://creo que no deberia llegar nunca aca
								return '';
						}
					}
			case 1:
				if(this.gane(0) > 0){//gane primera, todavia no jugo nadie
					switch(ultimo){
						case 'T':
							if (clasif.alta >= 1)
								return 'RT';
							return '';
						case 'RT':
							if (clasif.alta >= 1)
								return 'V';
							return '';
						default://esta en vale 4, no se puede hacer nada mas
							return '';
					}
					
				}
				else if (this.gane(0) === 0 ) {   // Pardamos Primeraaaaa 
					if (suMesa !==  null && this.laMato(suMesa) > -1 ) return (ultimo === 'T' ? 'RT' : 'V'  ) ;   
					if (clasif.alta > 0 ) return (ultimo === 'T' ? 'RT' : 'V'  );
					return '';
					 
				}
				else{//perdi primera, el humano ya jugo
					if(this.laMato(suMesa) !== -1){
						switch(ultimo){
							case 'T':
								if (mediaalta >= 2 && clasif.alta >= 1)	  return 'RT';
								return '';
							case 'RT':
								if (clasif.alta >= 2) return 'V';
								return '';
							default:
								return '';
						}
					}
					else{    // Ya perdi la ronda, no queda otra que mentir o irme (*)
						switch(ultimo){
							case 'T':
							case 'RT':
							case 'V':
								return '';
						}
					}
				}
				return '';
			case 2:
				if(this.gane(1) > 0){//perdi primera, gane segunda, juego yo primero
					switch(ultimo){
						case 'T':
							if(clasif.alta === 1)
								return 'RT';
							return '';
						case 'RT':
							if(this.cartasEnMano[0].valor >= 13)
								return 'V';
							return '';
						default://esta en vale 4, no se puede hacer nada mas
							return '';
					}
				}
				else if (this.gane(1) === 0 ) {  // Doble Pardaaaa	
					if (suMesa !==  null && this.laMato(suMesa) > -1 ) return (ultimo === 'T' ? 'RT' : 'V'  ) ;   
					if (clasif.alta > 0 ) return (ultimo === 'T' ? 'RT' : 'V'  );
					return '';
				}
				else{//gane primera y perdi segunda, el humano ya jugo
					switch(ultimo){
						case 'T':
							if(suMesa.valor < this.cartasEnMano[0].valor)
								return 'RT';
							if(suMesa.valor < 9)
								return 'RT';
							return '';
						case 'RT':
							if(suMesa.valor < this.cartasEnMano[0].valor)
								return 'V';
							return '';
						default://esta en vale 4, no se puede hacer nada mas
							return '';
					}
				}
				return '';
				break;
			}
	}
}
    //------------------------------------------------------------------
    // Determina el canto del envido
    //------------------------------------------------------------------
    
    IA.prototype.envido = function(ultimo,acumulado, ultimaCarta){
        var puntos = this.getPuntosDeEnvido(this.cartas);
		var p1 =  _rondaActual.equipoPrimero.puntos; 
		var p2 =  _rondaActual.equipoSegundo.puntos;
		var diff = p1 - p2;
		var loQueFalta = limitePuntaje - ((p1 > p2) ? p1 : p2);
		
		var posible = this.prob.CartaVista(ultimaCarta);
		var valor = this.prob.ponderarPuntos(puntos);
		var ran = getRandomInt(0,100);
		
        var puntosNoQuerido = _rondaActual.calcularPuntosEnvido().perdedor;

        if ( p2 >= limitePuntaje - 2  ){
            if (ultimo !== null && ultimo !== undefined)
                switch(ultimo){ //si me cantaron algo respondo con la falta
                    case 'E':
                    case 'R':
                    case 'EE':
                        return 'F';
                        break;
                }
            else{//sino me fijo si tengo algo decente para cantar y canto, 
                 // de ultima 
                    var pRE = this.prob.promedioPuntos(this.envidoS)  ;
					var pRE =  pRE === null ? 0 : -(15 -  pRE) ; 
					if (ran + diff <  valor  * 100 ) return   'F'  ;
					else return '';
                }
        }
                
        
        if (acumulado === 0){
			if (ultimaCarta !== undefined) {  // Canto siendo pie   
					if (puntos > 28) {
                        var pRE = this.prob.promedioPuntos( this.envidoS.concat(this.revire , this.realEnvido) );
                        if (pRE === null || pRE > puntos ) return ( puntos > 30 ? 'R' : 'E');
                        else return 'R';
                    }else {
                        if (ultimaCarta.puntosEnvido > puntos) return '';          // Si me gana con la mesa no canto...podria ser opcion para mentir
                        if (ran + posible + diff  <  valor  * 100 ) return   'E';
                        else return '';
                    }
			} else //Soy mano
				if (ran + posible  <  valor  * 100 ) return   'E';
				else return '';
 
        } else{        //me cantaron algo *******************************
            //return 'S';
            
            var rta = '';
            
            if (puntos <= 7) return 'N' ;
            
            //si gane o pierda me conviene la falta entonces la canto
            if (p2 > p1 && acumulado > loQueFalta &&  puntosNoQuerido > loQueFalta && ultimo !== 'F') 
                return 'F';
            
            //si hay mas en juego que lo que falta y voy ganando, considero la falta envido

            if (acumulado > loQueFalta && p2 > p1 && ultimo !== 'F') {
                var pRE = this.prob.promedioPuntos(this.realEnvido.concat(this.envidoS, this.revire));
                pRE = pRE === null ? 0 : -(15 -  pRE);
                alert ((ran + posible + diff + acumulado + pRE)  + '<' + (valor * 100));
                if(ran + posible + diff + acumulado + pRE < valor * 100) return 'F';
            }

            //si los puntos del no quiero hacen que pierda entonces juego el envido, en una de esas...
            if (puntosNoQuerido + p1 > 30) return 'S';

            //alert( ran + "  + " +  posible  +  " + " +  diff + " + " +  acumulado * 2   +  "  < "  + valor * 100  );
            
            switch(ultimo){
                case 'E':
					//if (puntos >= 30) ran = 0;
					var pRE = this.prob.promedioPuntos(this.envidoS)  ;
					var pRE =  pRE === null ? 0 :  -(15 -  pRE)  ; 
										                  
                    if (ran + posible + diff + acumulado + pRE  <  valor  * 100 ) {
						if (puntos >= 30 ) return  'EE' ; 
						else return 'S';
					} else { if (puntos >= 30 ) return 'S'; 
					         else  return 'N';  
					}
					break;
                case 'EE':
					if (puntos >= 30) ran = 0;
					var pRE =   this.prob.promedioPuntos(this.revire.concat(this.envidoS))  ;
					var pRE =  pRE === null ? 0 : -(15 -  pRE)  ;
					if (ran + posible + diff + acumulado  + pRE <  valor  * 100 ) return   'S'  ;
					else return 'N';
					break;
                case 'R':
					if (puntos >= 31) ran = 0;
					var pRE =  this.prob.promedioPuntos(this.realEnvido.concat(this.envidoS, this.revire))   ;
					var pRE =  pRE === null ? 0 :  -(15 -  pRE)  ;
					if (ran + posible + diff + acumulado * 2 + pRE * 2 <  valor  * 100 ) return   'S'  ;
					else return 'N';
					break;
                case 'F':
                    if (ran + posible  + diff + acumulado * 2 <  valor  * 100 ) return   'S'  ;
					else return 'N';
                    break;
            }
            return rta;
        }
    }
    
	//------------------------------------------------------------------
	// LA maquina elige una carta para jugar
	//------------------------------------------------------------------
	
	IA.prototype.jugarCarta =  function () {
		
		if(this.estrategiaDeJuego === null)
			this.estrategiaDeJuego = this.estrategiaClasica;
		
		var indice = this.estrategiaDeJuego();

		var carta = this.cartasEnMano[indice];
		_log.innerHTML = '<b>' + this.nombre + ' juega un :</b> ' + carta.getNombre() + '<br /> ' + _log.innerHTML ;
		this.cartasJugadas.push(carta);
		this.cartasEnMano.splice(indice,1);
		return carta;
	}
	
	//------------------------------------------------------
	// Diferentes estrategias para jugar las cartas
	//------------------------------------------------------
	IA.prototype.estrategiaClasica = function(){
		var primero = (_rondaActual.jugadasEnMano === 0) ? true : false;
		var carta = null;
		var nro = _rondaActual.numeroDeMano ;
		var indice = -1;
		var clasif = this.clasificarCartas(this.cartasEnMano);
		if (!primero) {
			carta = _rondaActual.equipoPrimero.jugador.cartasJugadas.getLast();
			var indice = this.elegir(1,carta);
			if (indice < 0 ) {
				indice = this.elegir(0);
			} else {
				if (nro === 0 && this.cartasEnMano[indice].valor >= 11 && carta.valor <= 7   ) //  No quemo me carta alta, espero a segundo
					indice = this.elegir(0);
			}
			
		} else {
			switch (nro) {
				case 0: 
					if (clasif.alta >= 2) indice = this.elegir(0);  // Dejo pasar primera, tengo dos altas
					
					else if ( clasif.alta  >= 1 ) {  // Juego la carta del medio
					
							indice = this.elegir(1 , null , 1);  
							if (indice < 0 ) indice = this.elegir(1 , null , 0); 
					
					} else  indice = this.elegir(1);   // Voy con lo mas alto de todo (aunque no sea muy alto)
					break;
				case 1:
					if ( _rondaActual.equipoSegundo.manos > _rondaActual.equipoPrimero.manos)  // Gane primera juego bajo
						indice = this.elegir(0);
					else   // Perdi o empate...tengo que tirar una alta 
						indice = this.elegir(1);
					
					break;
				case 2:  // No tengo nada mas por jugar
					indice = 0;
					break;
		
			}
		}
		return indice;
	}
	
	//estrategia de prueba:
	//se usa en la segunda mano
	//
	IA.prototype.estrategia1 = function(){
		var indice = -1;
		var clasif = this.clasificarCartas(this.cartasEnMano);
		
		if(clasif.baja === 1 && clasif.media === 1){
			return (this.cartasEnMano[0].valor < this.cartasEnMano[1].valor) ?  1 : 0;
		}
		return this.estrategiaClasica();
	}
