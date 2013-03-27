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
}
//------------------------------------------------------------------
//  Elige la carta mas baja o la mas alta segun los datos 
//------------------------------------------------------------------

IA.prototype.elegir  =  function ( orden , carta) {
var indice = -1;
var valor = (orden === 0) ? 99 : (carta === null ? -1: 99) ;
    for ( var c in this.cartasEnMano ) {
    var v_act = this.cartasEnMano[c].valor;
    switch (orden) {
	case 0:
	    if ( v_act < valor ) {valor = v_act ; indice = c; }
	    break;
	case 1:
	    if (carta === null) {
		if ( v_act > valor ) {valor = v_act ; indice = c; } 
	    } else {
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
	//  Determina el canto del truco
	//------------------------------------------------------------------
	
    IA.prototype.gane = function(nroMano){
        var e1 = _rondaActual.equipoPrimero;
        var e2 = _rondaActual.equipoSegundo;
        
        return (e2.jugador.cartasJugadas[nroMano].valor - e1.jugador.cartasJugadas[nroMano].valor);
    }

    IA.prototype.clasificarCartas = function(cartas){
        var media = 0, alta = 0, baja = 0;
        
        for(var i = 0; i < cartas.length; i++)
            if (cartas[i].valor <= 7 )
                baja++;
            else if (cartas[i].valor  <= 10)
                media++;
            else
                alta++;
        return {alta:alta, media:media, baja:baja};
    }
    
IA.prototype.truco = function (resp , ultimo) {
	var e1 = _rondaActual.equipoPrimero;
    var e2 = _rondaActual.equipoSegundo;
    var nroMano = _rondaActual.numeroDeMano;
    var posiblesCartas = (_rondaActual.puntosGuardados !== null) ?
        e2.jugador.prob.deducirCarta(_rondaActual.puntosGuardados, e1.jugador.cartasJugadas) : null;
        
    var enMano = e2.jugador.cartasEnMano;
    var miMesa = (e2.jugador.cartasJugadas.length === nroMano + 1 ) ?  e2.jugador.cartasJugadas[nroMano]  : null ;
    var suMesa = (e1.jugador.cartasJugadas.length === nroMano + 1 ) ?  e1.jugador.cartasJugadas[nroMano]  : null ;
    var clasif = this.clasificarCartas(this.cartasEnMano);
    // Tener en cuenta la carta que jugue
	var mediaalta = clasif.alta + clasif.media;
    
    if (resp) {  // Me cantaron, tengo que responder
        switch(nroMano){
            case 0:
                if (clasif.alta >= 2) return 'RT';
                if (e2.jugador.puntosGanadosEnvido < 2 && (mediaalta) >= 2 && clasif.alta >= 1)
                    return 'S';
                if (clasif.media === 3) return 'S';
                if (clasif.baja === 3) return 'RT'; //esto no deberia pasar siempre
                return 'N';
            case 1:
                if(this.gane(0) > 0 && mediaalta >= 1)
                    return ( clasif.alta >= 1 ? 'RT'  : 'S'  )  ;
                else if (mediaalta >= 1) 
                    return 'S'
                else return 'N';
            case 2:
                if(enMano.length > 0){
                    if(enMano[0].probGanar() > .724)
                        return (enMano[0].valor - 1 >= 12 ) ? 'RT' : 'S';
                    else
                        return 'N';
                }
                else{
                    if(e2.jugador.cartasJugadas[2].valor >= 10)
                        return 'S';
                    else
                        return 'N';
                }
        }
		}else if (ultimo === null || ultimo === undefined){//todavia no se canto nada
			switch(nroMano){
				case 0:
					return '';
				case 1:
					if (this.gane(0) > 0){//gane primera, el humano todavia no jugo la segunda carta
						if(clasif.alta >= 1)
							return 'T';
					}
					return '';
				case 2:
					if (this.gane(1) < 0){//perdi segunda, el humano ya jugo
						if(e2.jugador.cartasEnMano[0].valor > e1.jugador.cartasJugadas[2].valor)
							return 'T';
					}
					return '';
			}
		}
		else{ //tengo el quiero
			switch(nroMano){
				case 0:
				case 1:
					if(this.gane(0) > 0){
						if(clasif.alta >= 1)
							return 'RT';
					}
					return '';
				case 2:
					if (this.gane(1) > 0){//gane segunda, juego yo primero
						if(e2.jugador.cartasEnMano[0].valor >= 11)
							return 'RT';
					}
					return '';
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
		
		var posible = this.prob.CartaVista(ultimaCarta);
		var valor = this.prob.ponderarPuntos(puntos);
		var ran = getRandomInt(0,100);
		var loQueFalta = 30 - ((p1 > p2) ? p1 : p2);
        var puntosNoQuerido = _rondaActual.calcularPuntosEnvido().perdedor;

        if ( p2 === 29 ){
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
					if (ran + diff <  valor  * 150 ) return   'F'  ;
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
            return 'S';
            
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
		
		var primero = (_rondaActual.jugadasEnMano === 0) ? true : false;
		var carta = null;
		if (!primero)
			carta = _rondaActual.equipoPrimero.jugador.cartasJugadas.getLast();
		//determinarGanadorMano

		if (_rondaActual.numeroDeMano === 1 && _rondaActual.equipoSegundo.manos > _rondaActual.equipoPrimero.manos) {
			var indice = this.elegir(0);
		} else {		
			var indice = this.elegir(1,carta);
			if (indice < 0 ) 
				indice = this.elegir(0);
		}
		
		var carta = this.cartasEnMano[indice];
		//_log.innerHTML = '<b>' + this.nombre + ' juega un :</b> ' + carta.getNombre() + '<br /> ' + _log.innerHTML ;
		this.cartasJugadas.push(carta);
		this.cartasEnMano.splice(indice,1);
		return carta;
	}	
