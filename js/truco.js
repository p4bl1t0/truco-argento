(function(window, undefined) {
	'use strict';
	var _log = document.getElementById('log');
	var _rondaActual = null;
	var _partidaActual = null;
	var audio = {};
	
	
	
	//Funciones Primitivas
	function getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	function getRandomReal (min, max) {
		return Math.random() * (max - min + 1) + min;
	}
	
	Array.prototype.getLast = function() {
    if ( this.length > 0 )
        return this[ this.length - 1 ];
    else
        return undefined;
	};
	
	//Objetos
	/*******************************************************************
	 * 
	 * Clase Distribucion Normal
	 * 
	 *******************************************************************
	*/ 
	function DistribucionNormal (a,b , m , d) {
		this.media = m;
		this.desvio  = d;
		this.cons = 1 / ( this.desvio  * Math.sqrt(  2 * Math.PI) );
		
	}
	
	DistribucionNormal.prototype.f = function(v){
		var interior = ( (v - this.media  ) / this.desvio  ) ;
		return  this.cons * Math.exp( (-1/2) * interior * interior ) ;
	} 
	
	DistribucionNormal.prototype.getNumber = function () {
		do {
			var x = getRandomReal ( this.media - this.desvio * 5   , this.media + this.desvio * 5   ) ;
			var y = getRandomReal (0,1);
			var fx = this.f(x);
		} while ( fx > y );
		return x;
	}
	
	DistribucionNormal.prototype.getNumberAB = function (A,B) {
		do {
			var x = getRandomReal ( A  , B   ) ;
			var y = getRandomReal (0,1);
			var fx = this.f(x);
		} while ( fx > y );
		return x;
	}
	
	var tt = new DistribucionNormal(100,5);
	var t = tt.getNumberAB(0,100)
	alert(  t  );
	
	/*******************************************************************
	 * 
	 * Clase Naipe
	 * 
	 *******************************************************************
	*/ 
	
	function Naipe (v, p, n, t) {
		this.valor = 0;
		this.puntosEnvido = 0;
		this.numero = 0;
		this.palo = '';
		if(v !== null && v !== undefined) {
			this.valor = v;
		}
		if(p !== null && p !== undefined) {
			this.puntosEnvido = p;
		}
		if(n !== null && n !== undefined) {
			this.numero = n;
		}
		if(t !== null && t !== undefined) {
			this.palo = t;
		}
		
	}
	
	Naipe.prototype.getCSS = function () {
		var x = 97.5;
		var y = 150;
		switch (this.palo) {
			case 'Oro':
				y = y * 0;
				break;
			case 'Copa':
				y = y * -1;
				break;
			case 'Espada':
				y = y * -2;
				break;
			case 'Basto':
				y = y * -3;
				break; 
		}
		x = x * -1 * (this.numero - 1);
		return x.toString() + 'px ' + y.toString() + 'px'; 
	}
	
	Naipe.prototype.getNombre = function () {
		return this.numero + ' de ' + this.palo;
	};
	
	/*******************************************************************
	 * 
	 * Clase Jugador
	 * 
	 *******************************************************************
	*/ 
	
	function Jugador () {
		this.cartas = new Array();
		this.cartasEnMano = new Array();
		this.cartasJugadas = new Array();
		this.esHumano = true;
		this.nombre = '';
	}
	
	Jugador.prototype.sayCartasEnMano = function () {
		var html = '';
		//var html = '<br /><strong>' + this.nombre + ':</strong><ul>';
		for (var i = 0; i < this.cartasEnMano.length; i++) {
			if(this.cartasEnMano[i] !== undefined) {
				if(!this.esHumano) {
					html += '<li class="naipe naipe-boca-abajo"></li>';
				} else {
					var estilo = ' style="background-position: ' + this.cartasEnMano[i].getCSS() + ';"';
				    html += '<li><a href="#" class="naipe naipe-humano" data-naipe-index="' + i +'" ' + estilo +'></a></li>';
				}
			}
		}
		if(this.esHumano) {
			$('#player-one').find('.player-cards').html(html);
		} else {
			$('#player-two').find('.player-cards').html(html);
		}
		//html += '</ul>';
		//_log.innerHTML += html;
	}
	
	Jugador.prototype.getPuntosDeEnvido = function () {
		var pares = { 
			Espada: new Array(),
			Basto: new Array(),
			Oro: new Array(),
			Copa: new Array()
		};
		for (var i = 0; i < this.cartas.length; i++) {
			var carta = this.cartas[i];
			if(carta !== undefined) {
				pares[carta.palo].push(carta.puntosEnvido);
			}
		}
		var puntos = 0; 
		var prop;
		for (prop in pares) {
			if(pares.hasOwnProperty(prop)) {
				if(pares[prop].length >= 2) {
					if(pares[prop].length === 3) {
						//Tres cartas
						pares[prop].sort(function(a,b){return b-a});
					}
					puntos = 20 + pares[prop][0] + pares[prop][1];
					break;
				} 
			} 
		}
		if(puntos === 0) {
			//Tengo tres distintas elijo la de puntaje más alto
			var maximo = 0;
			for (prop in pares) {
				if(pares[prop].length > 0 && maximo < pares[prop][0]) {
					maximo = pares[prop][0];
				}
			}
			puntos = maximo;
		}
		return puntos;
	}
	
	Jugador.prototype.jugarCarta =  function (indice) {
		if(indice !== null && indice !== undefined && this.cartasEnMano.length > indice) {
			var carta = this.cartasEnMano[indice];
			_log.innerHTML = '<b>' + this.nombre + ' juega un :</b> ' + carta.getNombre() + '<br /> ' + _log.innerHTML ;
			this.cartasJugadas.push(carta);
			this.cartasEnMano.splice(indice,1);
			return carta;
		}
	}
	/*******************************************************************
	 * 
	 * Clase Probabilidad
	 * 
	 *******************************************************************
	*/ 
	function Probabilidad()  {
		// Parametros para calcular la probabilidad de los puntos
		this.m1 = 0.15;
		this.m2 = 0.20;
		// Parametros para la carta vista
		this.cv1 = -20;
		this.cv2 = 20;
	}
	
	Probabilidad.prototype.ponderarPuntos = function(puntos) {
		var pen1 = this.m1 / 7 ;
		var pen2 = (1 - this.m2) / ( 33 - 20 ); 
		var h = 1 - 33 * pen2 ;
		
		if ( puntos <= 7 ) return puntos * pen1 ;
		else return puntos * pen2 + h;  
		
	}
	
	Probabilidad.prototype.CartaVista = function(carta) {
		if (carta === undefined) return 0;
		else {
			var e = carta.puntosEnvido;
			var m = (this.cv2 -  this.cv1) / 7 ;
			var h = this.cv1;
			return  e * m + h;
		}		
	}
	
		
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
    
    IA.prototype.envido = function(ultimo,acumulado, ultimaCarta){
        var puntos = this.getPuntosDeEnvido();
		var p1 =  _rondaActual.equipoPrimero.puntos; 
		var p2 =  _rondaActual.equipoSegundo.puntos;
		
		var diff = p1 - p2;
		
		var posible = this.prob.CartaVista(ultimaCarta);
		
		var valor = this.prob.ponderarPuntos(puntos);
		var ran = getRandomInt(0,100);
		
        if ( p2 === 29 ) return ultimo === 'F' ? 'S' :  'F';
        
        if (acumulado === 0){
				// El factor rando deberia desaparecer?????
				alert( ran + "  + " +  posible  +   "  < "  + valor * 100  );
                if (ran + posible  <  valor  * 100 ) return   'E'   ;
                else return '';
 
        } else{//me cantaron algo
            var rta = '';
            alert( ran + "  + " +  posible  +  " + " +  diff + " + " +  acumulado * 2   +  "  < "  + valor * 100  );
            
            switch(ultimo){
                case 'E':
					if (ran + posible + diff + acumulado  <  valor  * 100 ) return   'S'  ;
					else return 'N';
					break;
                case 'EE':
					if (ran + posible + diff + acumulado <  valor  * 100 ) return   'S'  ;
					else return 'N';
					break;
                case 'R':
					if (ran + posible + diff + acumulado * 1.5 <  valor  * 100 ) return   'S'  ;
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
		_log.innerHTML = '<b>' + this.nombre + ' juega un :</b> ' + carta.getNombre() + '<br /> ' + _log.innerHTML ;
		this.cartasJugadas.push(carta);
		this.cartasEnMano.splice(indice,1);
		return carta;
	}	
		
	/*******************************************************************
	 * 
	 * Clase Ronda
	 * 
	 *******************************************************************
	*/	
		
	function Ronda (equipo1, equipo2) {
		this.equipoPrimero = equipo1;
		this.equipoSegundo = equipo2;
		this.numeroDeMano = 0;
		this.jugadasEnMano = 0;
		this.equipoEnTurno = null;
		this.enEspera = false;
		// Variables de entorno para manejar el envido		
		this.puedeEnvido = true;
		this.cantos = new Array();   // Posibles valores: "E" "EE" "RE" "FE"
		this.equipoEnvido = null;   
        //Variables para manejar el truco
        this.equipoTruco = null;
        this.puedeTruco = null;
        this.noQuiso = null;
        this.truco = new Array();
	}
	
	Ronda.prototype.equipoEnEspera = function (e) {
		
		if (e === this.equipoPrimero) 
			return this.equipoSegundo;
		else if (e === this.equipoSegundo)
			return this.equipoPrimero;
		else 
			return null;
        
	}
	
	Ronda.prototype.pasarTurno = function () {
		if(this.equipoEnTurno === this.equipoPrimero) {
			this.equipoEnTurno = this.equipoSegundo;
        } else {
            this.equipoEnTurno = this.equipoPrimero;
        }
        this.jugadasEnMano = this.jugadasEnMano + 1;
	}
	
	Ronda.prototype.iniciar = function () {
		this.equipoPrimero.manos = 0;
		this.equipoSegundo.manos = 0;
		var c = this.repartirCartas(this.equipoPrimero.jugador, this.equipoSegundo.jugador);
		if(this.equipoPrimero.esMano) {
			this.equipoPrimero.esSuTurno = true;
			this.equipoEnTurno = this.equipoPrimero;
		} else {
			this.equipoSegundo.esSuTurno = true;
			this.equipoEnTurno = this.equipoSegundo;
		}
		//#LOG
		
		//_log.innerHTML = '<strong>Número de cartas en el mazo:</strong> ' + c +' naipes. <br />' + _log.innerHTML ;
		this.equipoPrimero.jugador.sayCartasEnMano();
		_log.innerHTML = this.equipoPrimero.jugador.nombre + ' puntos para el envido: ' + this.equipoPrimero.jugador.getPuntosDeEnvido() + '<br />' + _log.innerHTML ;
		this.equipoSegundo.jugador.sayCartasEnMano();
		_log.innerHTML = this.equipoSegundo.jugador.nombre + ' puntos para el envido: ' + this.equipoSegundo.jugador.getPuntosDeEnvido() + '<br />'  + _log.innerHTML ;
		//---------------------------------
		this.continuarRonda();
		
	}
	
	Ronda.prototype.decidirCarta = function () {
		if(this.equipoEnTurno !== null) {
				if(this.equipoEnTurno.jugador.esHumano) {
					//Debería esperar de la persona
					//----------------------------------
					this.enEspera = true;
					_rondaActual = this;
					$("#Quiero").hide();
					$("#NoQuiero").hide();
					$(".canto").hide();
					$(".cantot").hide();
					var ultimo = this.truco.getLast();
					switch(ultimo){
						case 'T':
							$('#reTruco').show();
							break;
						case 'RT':
							$('#vale4').show();
							break;
						case 'V':
							break;
						default:
							$('#Truco').show();
							break;
					}
					if (this.puedeEnvido === true){
						$(".canto").show();
						$(".canto").unbind('click').click(function (event){ 
							var c = $(this).attr('data-envido');
                            _rondaActual.puedeEnvido = false;
							_rondaActual.cantos.push(c);
							_rondaActual.equipoEnvido = _rondaActual.equipoEnEspera(_rondaActual.equipoEnTurno);
							_rondaActual.logCantar(_rondaActual.equipoEnTurno.jugador,c);
							_rondaActual.enEspera = false;
							$(this).unbind('click');
                            //deshabilito los cantos correspondientes
                            $(".boton").hide();
							_rondaActual.continuarRonda();
						
						} );}
						
					if (this.puedeTruco === null || this.puedeTruco === this.equipoEnTurno ){
                        $(".cantot").unbind('click').click(function(event){
							//alert("AAA");
                            var c = $(this).attr('data-truco');
                            _rondaActual.truco.push(c);
                            _rondaActual.equipoTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoEnTurno);
                            _rondaActual.logCantar(_rondaActual.equipoEnTurno.jugador, c);
                            _rondaActual.enEspera = false;
                            $(".boton").hide();
                            $(this).unbind('click');
                            _rondaActual.continuarRonda();})
                    }
                    
                    
					$('.naipe-humano').unbind('click.jugar').not('.naipe-jugado').bind('click.jugar', function (event) {
					    event.preventDefault();
					    var $naipe = $(this);
					    $naipe.addClass('naipe-jugado');
					    var $elementoPosicionador = $('.card-' + (_rondaActual.numeroDeMano * 2 + 1));
						$naipe.css("transform", "translate(" + ($elementoPosicionador.offset().left - $naipe.offset().left) + "px, " + ($elementoPosicionador.offset().top - $naipe.offset().top)  + "px )");
					    var index = parseInt($(this).attr('data-naipe-index'), 10);
					    
					    $('.naipe-humano').not('.naipe-jugado').each(function (){
							var aux = parseInt($(this).attr('data-naipe-index'), 10);
							if (aux > index) $(this).attr('data-naipe-index', (aux - 1));
						});
					    _rondaActual.equipoEnTurno.jugador.jugarCarta(index);
					    _rondaActual.enEspera = false;
					    $('.naipe-humano').unbind('click.jugar');
					    _rondaActual.pasarTurno();
					    _rondaActual.continuarRonda();
					});
				} else {   // DECIDE LA MAQUINAAAAAAAAAAAAAAAAA
					_rondaActual = this;
                    if (_rondaActual.puedeEnvido === true){
						//var ultimo = this.cantos.getLast();
						var carta  = this.equipoPrimero.jugador.cartasJugadas.getLast();   // Convertir en relativos 
						var accion = this.equipoSegundo.jugador.envido( this.cantos.getLast() ,this.calcularPuntosEnvido().ganador,carta);
						if (accion !== '') {
							if(audio[accion] !== null && audio[accion] !== undefined) {
								audio[accion].play();
							}
							_rondaActual.puedeEnvido = false;
							_rondaActual.cantos.push(accion);
							_rondaActual.equipoEnvido = _rondaActual.equipoEnEspera(_rondaActual.equipoEnTurno);
							_rondaActual.logCantar(_rondaActual.equipoEnTurno.jugador,accion);
							return ;
						}
                    }
					var carta = this.equipoEnTurno.jugador.jugarCarta();
					var $elementoPosicionador = $('.card-' + (this.numeroDeMano + 1) * 2);
					var $card = $('#player-two').find('li:eq(' + (this.equipoEnTurno.jugador.cartasJugadas.length - 1).toString() +')');
					$card.css('background-position', carta.getCSS())
						 //.css('position', 'absolute')
						 //.css('top', (_elementoPosicionador.offset().top - _card.offset().top + 35) + 'px')
						 //.css('left', (_elementoPosicionador.offset().left - _card.offset().left +10) + 'px');
						 //-moz-transform:  translate(0,-15%);
						 .css("transform", "translate(" + ($elementoPosicionador.offset().left - $card.offset().left) + "px, " + ($elementoPosicionador.offset().top - $card.offset().top)  + "px )");
					
					this.pasarTurno();
				}
			}
	}
    Ronda.prototype.decidirTruco = function(){
        if (this.equipoTruco.jugador.esHumano) {
            $('.cantot').hide();
            $('.boton').show();
            var ultimo = this.cantos.getLast();
            switch(ultimo){
                case 'T':
                    $('#reTruco').show();
                    break;
                case 'RT':
                    $('#vale4').show();
                    break;
            }
            this.enEspera = true;
            _rondaActual = this;
            
            $('.cantot').unbind('click').click(function (event){
                var c = $(this).attr('data-truco');
				_rondaActual.logCantar(_rondaActual.equipoTruco.jugador,c);
				_rondaActual.truco.push(c);
				_rondaActual.equipoTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoTruco);
				_rondaActual.enEspera = false;
				$(this).unbind('click');
				_rondaActual.continuarRonda();
            })

            $("#Quiero").unbind('click').click(function (event){
				_rondaActual.logCantar(_rondaActual.equipoTruco.jugador,"S");
				_rondaActual.equipoTruco = null;
				_rondaActual.puedeTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoTruco);
				_rondaActual.enEspera = false;
				$(this).unbind('click');
				_rondaActual.continuarRonda();
			});
			
			$("#NoQuiero").unbind('click').click(function (event)  {
				_rondaActual.logCantar(_rondaActual.equipoTruco.jugador,"N");
                _rondaActual.noQuiso = _rondaActual.equipoTruco;
				_rondaActual.enEspera = false;
				$(this).unbind('click');
				_rondaActual.continuarRonda();
			});
        }else{//la maquina decide
            /*_rondaActual.logCantar(_rondaActual.equipoTruco.jugador,"S");
			_rondaActual.equipoTruco = null;
			_rondaActual.puedeTruco = _rondaActual.equipoEnEspera(_rondaActual.equipoTruco);*/
			_rondaActual.logCantar(_rondaActual.equipoTruco.jugador,"N");
            _rondaActual.noQuiso = _rondaActual.equipoTruco;
        }
    }
	
	Ronda.prototype.decidirEnvido = function () {
		if (this.equipoEnvido.jugador.esHumano) {   // Creo los bind para que el jugador decida
			var ultimo = this.cantos.getLast();
			$('.canto').hide();
			$("#Quiero").show();
			$("#NoQuiero").show();
			switch (ultimo) {
				case 'E':
					$('#Envido').show();
				case 'EE':
					$('#RealEnvido').show();
				case 'R':
					$('#FaltaEnvido').show();
			}
			this.enEspera = true;
			_rondaActual = this;
			
			$(".canto").unbind('click').click(function (event){ 
				var c = $(this).attr('data-envido');
				if (ultimo === "E" && c === "E") c = "EE";
				_rondaActual.logCantar(_rondaActual.equipoEnvido.jugador,c);
				_rondaActual.cantos.push(c);
				_rondaActual.equipoEnvido = _rondaActual.equipoEnEspera(_rondaActual.equipoEnvido);
				_rondaActual.enEspera = false;
				$(this).unbind('click');
				_rondaActual.continuarRonda();
			} );
			
			
			
			$("#Quiero").unbind('click').click(function (event){
				_rondaActual.logCantar(_rondaActual.equipoEnvido.jugador,"S");
				_rondaActual.jugarEnvido(true);
				_rondaActual.enEspera = false;
				$(this).unbind('click');
				_rondaActual.continuarRonda();
			});
			
			$("#NoQuiero").unbind('click').click(function (event)  {
				_rondaActual.logCantar(_rondaActual.equipoEnvido.jugador,"N");
				_rondaActual.jugarEnvido(false);
				_rondaActual.enEspera = false;
				$(this).unbind('click');
				_rondaActual.continuarRonda();
			});
			
		} else {// La maquina debe generar una respuesta
            //var ultimenvidoo = this.cantos.getLast();
            _rondaActual = this;
            var carta  = this.equipoPrimero.jugador.cartasJugadas.getLast();
            var accion = this.equipoSegundo.jugador.envido(this.cantos.getLast(),  this.calcularPuntosEnvido().ganador,carta);
            if(accion !== '') {
				if(audio[accion] !== null && audio[accion] !== undefined) {
					audio[accion].play();
				}
				if (accion === 'S' || accion === 'N'){
					_rondaActual.logCantar(_rondaActual.equipoEnvido.jugador,accion);
					_rondaActual.jugarEnvido((accion === 'S') ? true : false);
				}
				else{
					_rondaActual.cantos.push(accion);
					_rondaActual.logCantar(_rondaActual.equipoEnvido.jugador,accion);
					_rondaActual.equipoEnvido = _rondaActual.equipoEnEspera(_rondaActual.equipoEnvido);
				}
			}
			
		}
	}
    

	
	Ronda.prototype.continuarRonda = function () {
		var ganador = null;
		while (ganador === null) {
			if(this.jugadasEnMano === 2 || this.noQuiso != null) {
				if (this.jugadasEnMano === 2) {
					this.puedeEnvido = false;
					this.jugadasEnMano = 0;
					this.equipoEnTurno = this.determinarGanadorMano(this.numeroDeMano);
				}
				ganador = this.determinarGanadorRonda();
				this.numeroDeMano = this.numeroDeMano + 1;
				if(this.numeroDeMano === 3 || ganador !== null) {
					break;
				}
			}

			if (this.equipoEnvido === null && this.equipoTruco === null) 
				this.decidirCarta();
            else if (this.equipoEnvido !== null)
                this.decidirEnvido();
            else
                this.decidirTruco();

			if (this.enEspera === true)  break; 	
		}
		if(ganador !== null) {
			var repartir = function ()  {
				_log.innerHTML = 'Resultado Ronda: <b><i>' + ganador.nombre + '</i></b>'  + '<br /> ' + _log.innerHTML ;
				_partidaActual.continuar();
			}
			var juntarNaipes = function () {
			$('.naipe').remove();
			}
			setTimeout(juntarNaipes, 2000);
			setTimeout(repartir, 2500);
		}	
	}
	
	Ronda.prototype.jugarEnvido = function (d) {
		var puntos = this.calcularPuntosEnvido();
		if (d) { // Dijo Quiero
			if (this.equipoPrimero.esMano) {
				var primero = this.equipoPrimero; var p1 = primero.jugador.getPuntosDeEnvido();
				var segundo = this.equipoSegundo; var p2 = segundo.jugador.getPuntosDeEnvido();
			} else {
				var primero = this.equipoSegundo; var p1 = primero.jugador.getPuntosDeEnvido();
				var segundo = this.equipoPrimero; var p2 = segundo.jugador.getPuntosDeEnvido();
			}
		
			this.logCantar(primero.jugador , p1);
			if (p2 > p1 ) {
				this.logCantar(segundo.jugador , p2);
				segundo.puntos += puntos.ganador;
			}else{
				primero.puntos += puntos.ganador;
			}

		} else { // No Quiero
			var ganador = this.equipoEnEspera(this.equipoEnvido);	
			ganador.puntos += puntos.perdedor;
		}
		
		this.puedeEnvido = false;
		this.equipoEnvido = null;
        this.cantos = [];
	}
	
	Ronda.prototype.calcularPuntosEnvido = function () {
		var g = 0 , p = 0;
		for (var c in this.cantos){
			switch (this.cantos[c]) {
				case 'E':
					g += 2;
					p += 1;
					break;
				case 'EE':
					g += 2;
					p += 1; 
					break;
				case 'R':
					g += 3;
					p += 1;
					break;
				case 'F':
					g = 30 - (this.equipoPrimero.puntos < this.equipoSegundo.puntos ? this.equipoSegundo.puntos : this.equipoPrimero.puntos)  ;          // GANA EL PARTIDO POR EL MOMENTO
					p += 1; 
					break;
			}
		}
		return {ganador:g ,perdedor:p};    
	}
     
    Ronda.prototype.calcularPuntosTruco = function(){
        var g = 0, p = 0; 
        var c = this.truco.getLast();
        switch(c){
            case 'T':
                g = 2;
                p = 1;
                break;
            case 'RT':
                g = 3;
                p = 2;
                break;
            case 'V':
                g = 4;
                p = 3;
                break;
            default: //si no se canto truco la ronda vale 1 punto
                g = 1;
                break;
        }
        return {querido:g, noQuerido:p};
    }
	
	Ronda.prototype.logCantar = function (jugador,canto) {
		var mensaje = "<b>" + jugador.nombre + " canto: " + "</b>" ;
		switch (canto){
			case "E":
			case "EE":
				mensaje +=  " Envido";
				break;
			case "R":
				mensaje +=  " Real Envido";
				break;
			case "F":
				mensaje +=  " Falta Envido";
				break;		
            case "T":
                mensaje += " Truco";
                break;
            case "RT":
                mensaje += " Quiero re Truco";
                break;
            case "V":
                mensaje += "Quiero vale 4";
                break;
			case "S":
				mensaje +=  " Quiero";
				break;		
			case "N":
				mensaje +=  " No Quiero";
				break;		
			default :
				mensaje += canto ;
				break;
		}		
		
		_log.innerHTML = mensaje + '<br /> ' + _log.innerHTML ;
		
	}
	
	Ronda.prototype.repartirCartas = function(j1, j2) {
		if(j1 === null || j1 === undefined) {
			j1 = this.equipoPrimero.jugador;
		}
		if(j2 === null || j2 === undefined) {
			j2 = this.equipoSegundo.jugador;
		}
		if(j2.esMano) {
			var swap = j1;
			j1 = j2;
			j2 = swap;
			swap = null;
		}
		j1.cartas = new Array();
		j1.cartasEnMano = new Array();
		j1.cartasJugadas = new Array();
		j2.cartas = new Array();
		j2.cartasEnMano = new Array();
		j2.cartasJugadas = new Array();
		
		var maso = this.generarBaraja();
		for (var i = 1; i <= 6; i++) {
			var _log = document.getElementById('log');
			var index = getRandomInt(0, (maso.length - 1));
			if(i % 2 === 0) {
				j2.cartas.push(maso[index]);
				j2.cartasEnMano.push(maso[index]);
				_log.innerHTML = '<b>' + j2.nombre + ' tiene un :</b> ' + maso[index].getNombre() + '<br /> ' + _log.innerHTML ;
			} else {
				j1.cartas.push(maso[index]);
				j1.cartasEnMano.push(maso[index]);
			}
			maso.splice(index, 1);
			
		}
		return maso.length;
		
	}
	
	Ronda.prototype.generarBaraja = function () {
		var baraja = new Array();
		baraja.push(new Naipe(14, 1, 1, 'Espada'));
		baraja.push(new Naipe(13, 1, 1, 'Basto'));
		baraja.push(new Naipe(12, 7, 7, 'Espada'));
		baraja.push(new Naipe(11, 7, 7, 'Oro'));
		baraja.push(new Naipe(10, 3, 3, 'Espada'));
		baraja.push(new Naipe(10, 3, 3, 'Basto'));
		baraja.push(new Naipe(10, 3, 3, 'Oro'));
		baraja.push(new Naipe(10, 3, 3, 'Copa'));
		baraja.push(new Naipe(9, 2, 2, 'Espada'));
		baraja.push(new Naipe(9, 2, 2, 'Basto'));
		baraja.push(new Naipe(9, 2, 2, 'Oro'));
		baraja.push(new Naipe(9, 2, 2, 'Copa'));
		baraja.push(new Naipe(8, 1, 1, 'Oro'));
		baraja.push(new Naipe(8, 1, 1, 'Copa'));
		baraja.push(new Naipe(7, 0, 12, 'Espada'));
		baraja.push(new Naipe(7, 0, 12, 'Basto'));
		baraja.push(new Naipe(7, 0, 12, 'Oro'));
		baraja.push(new Naipe(7, 0, 12, 'Copa'));
		baraja.push(new Naipe(6, 0, 11, 'Espada'));
		baraja.push(new Naipe(6, 0, 11, 'Basto'));
		baraja.push(new Naipe(6, 0, 11, 'Oro'));
		baraja.push(new Naipe(6, 0, 11, 'Copa'));
		baraja.push(new Naipe(5, 0, 10, 'Espada'));
		baraja.push(new Naipe(5, 0, 10, 'Basto'));
		baraja.push(new Naipe(5, 0, 10, 'Oro'));
		baraja.push(new Naipe(5, 0, 10, 'Copa'));
		baraja.push(new Naipe(4, 7, 7, 'Basto'));
		baraja.push(new Naipe(4, 7, 7, 'Copa'));
		baraja.push(new Naipe(3, 6, 6, 'Espada'));
		baraja.push(new Naipe(3, 6, 6, 'Basto'));
		baraja.push(new Naipe(3, 6, 6, 'Oro'));
		baraja.push(new Naipe(3, 6, 6, 'Copa'));
		baraja.push(new Naipe(2, 5, 5, 'Espada'));
		baraja.push(new Naipe(2, 5, 5, 'Basto'));
		baraja.push(new Naipe(2, 5, 5, 'Oro'));
		baraja.push(new Naipe(2, 5, 5, 'Copa'));
		baraja.push(new Naipe(1, 4, 4, 'Espada'));
		baraja.push(new Naipe(1, 4, 4, 'Basto'));
		baraja.push(new Naipe(1, 4, 4, 'Oro'));
		baraja.push(new Naipe(1, 4, 4, 'Copa'));
		return baraja;
	}
	
	Ronda.prototype.determinarGanadorMano = function (indice, acumularPuntos) {
		if(acumularPuntos == undefined || acumularPuntos == null) {
			acumularPuntos = true;
		}
		var j1 = this.equipoPrimero.jugador;
		var j2 = this.equipoSegundo.jugador;
		if (j1.cartasJugadas[indice].valor > j2.cartasJugadas[indice].valor) {
			if(acumularPuntos) {
				this.equipoPrimero.manos = this.equipoPrimero.manos + 1;
			}
			_log.innerHTML = 'Resultado de la mano: <i>GANADOR ' + this.equipoPrimero.jugador.nombre + '</i><br />'  + _log.innerHTML ;
			return this.equipoPrimero;
		} else {
			if (j1.cartasJugadas[indice].valor < j2.cartasJugadas[indice].valor) {
				if(acumularPuntos) {
					this.equipoSegundo.manos = this.equipoSegundo.manos + 1;
				}
				_log.innerHTML = 'Resultado de la mano: <i>GANADOR ' + this.equipoSegundo.jugador.nombre + '</i><br />'  + _log.innerHTML ;
				return this.equipoSegundo;
			} else {
				if(acumularPuntos) {
					this.equipoPrimero.manos = this.equipoPrimero.manos + 1;
					this.equipoSegundo.manos = this.equipoSegundo.manos + 1;
				}
				_log.innerHTML = 'Resultado de la mano: <i>PARDA</i><br />' + _log.innerHTML ;
				if(this.equipoPrimero.esMano) {
					return this.equipoPrimero;
				} else {
					return this.equipoSegundo;
				}
			}
		}
	}
	
	Ronda.prototype.determinarGanadorRonda = function () {
		var e1 = this.equipoPrimero;
		var e2 = this.equipoSegundo;
        var puntosTruco = this.calcularPuntosTruco();
        if (this.noQuiso !== null){
            var equipoGanador = this.equipoEnEspera(this.noQuiso);
            equipoGanador.puntos += puntosTruco.noQuerido;
            return equipoGanador.jugador;
		} else if(e1.manos === e2.manos && (e1.manos === 3 || e1.manos === 2)) {
			if(e1.manos ===  3) {
				//PARDAMOS las tres, gana el mano
				if(e1.esMano) {
					//e1.puntos = e1.puntos + 1;
                    e1.puntos = e1.puntos + puntosTruco.querido;
					return e1.jugador;
				} else {
					e2.puntos = e2.puntos + puntosTruco.querido;
					return e2.jugador;
				}
			} else {
				//Repartimos 1ra y 2da, PARDAMOS tercer, gana el que ganó primera
				if(e1 === this.determinarGanadorMano(0, false)) {
					e1.puntos = e1.puntos + puntosTruco.querido;
					return e1.jugador;
				} else {
					e2.puntos = e2.puntos + puntosTruco.querido;
					return e2.jugador;
				}
			}	
		} else {
			if(e1.manos == 2 && e1.manos > e2.manos) {
				e1.puntos = e1.puntos + puntosTruco.querido;
				return e1.jugador;
			} else {
				if(e2.manos == 2 && e2.manos > e1.manos) {
					e2.puntos = e2.puntos + puntosTruco.querido;
					return e2.jugador;
				} else {
					//Sin ganador
					console.log("j1: " + e1.manos + "j2: " + e2.manos);
					return null;
				}
			}
		}
		
	}
	
	/*******************************************************************
	 * 
	 * Clase Partida
	 * 
	 *******************************************************************
	*/
	
	function Partida () {
		this.equipoPrimero = {
			jugador: {},
			puntos: 0,
			esMano: false,
			manos: 0,
			esSuTurno: true
		};
		this.equipoSegundo = {
			jugador: {},
			puntos: 0,
			esMano: true,
			manos: 0,
			esSuTurno: false
		};
	}
	
	Partida.prototype.iniciar = function (nombreJugadorUno, nombreJugadorDos) {
		var jugador1 = new Jugador();
		if(nombreJugadorUno !== null && nombreJugadorUno !== undefined && nombreJugadorUno !== '') {
			jugador1.nombre = nombreJugadorUno;
		} else {
			jugador1.nombre = 'Jugador 1';
		}
		this.equipoPrimero.jugador = jugador1;
		var maquina = new IA();
		maquina.prob = new Probabilidad();
		//maquina.esHumano = false;
		if(nombreJugadorDos !== null && nombreJugadorDos !== undefined && nombreJugadorDos !== '') {
			maquina.nombre = nombreJugadorDos;
		} else {
			maquina.nombre = 'Maquina';
		}
		this.equipoSegundo.jugador = maquina;
		
		var _$tbl = $('#game-score');
		_$tbl.find('.player-one-name').html(jugador1.nombre);
		_$tbl.find('.player-two-name').html(maquina.nombre);
		_$tbl.find('.player-one-points').html('0');
		_$tbl.find('.player-two-points').html('0');
		$('#player-two').find('.player-name').html(maquina.nombre);
		$('#player-one').find('.player-name').html(jugador1.nombre);
		
		this.continuar();
	}
	
	Partida.prototype.continuar = function () {
	    while (this.equipoPrimero.puntos < 30 && this.equipoSegundo.puntos < 30) {
			var _$tbl = $('#game-score');
			_log.innerHTML =  "";
			_$tbl.find('.player-one-points').html(this.equipoPrimero.puntos);
			_$tbl.find('.player-two-points').html(this.equipoSegundo.puntos);
			_log.innerHTML = '<hr />' + '<br /> Puntaje parcial : ' + this.equipoPrimero.jugador.nombre + ' ' + this.equipoPrimero.puntos + ' - '+ this.equipoSegundo.jugador.nombre + ' ' + this.equipoSegundo.puntos + '<br /> ' + '<hr />' + _log.innerHTML ;
			if(this.equipoSegundo.esMano) {
				this.equipoSegundo.esMano = false;
				this.equipoPrimero.esMano = true;
			} else {
				this.equipoSegundo.esMano = true;
				this.equipoPrimero.esMano = false;
			}
			var ronda = new Ronda(this.equipoPrimero, this.equipoSegundo);
			ronda.iniciar();
			if(ronda.enEspera) {
				break;
			}
			
		}
		if(!(this.equipoPrimero.puntos < 5 && this.equipoSegundo.puntos < 5)) {
		    _log.innerHTML = '<hr />' + '<br /> PUNTAJE FINAL : ' + this.equipoPrimero.jugador.nombre + ' ' + this.equipoPrimero.puntos + ' - '+ this.equipoSegundo.jugador.nombre + ' ' + this.equipoSegundo.puntos + _log.innerHTML ;
		}
	}
	
	
	
	//******************************************************************
	//******************************************************************
	
	$(document).ready(function () {
		//Cargo recursos
		var a = new Audio();
		a.setAttribute("src","audio/envido.wav");
		a.load();
		audio['E'] = a;
		a = new Audio();
		a.setAttribute("src","audio/real-envido.wav");
		a.load();
		audio['R'] = a;
		a = new Audio();
		a.setAttribute("src","audio/falta-envido.wav");
		a.load();
		audio['F'] = a;
		a = new Audio();
		a.setAttribute("src","audio/quiero.wav");
		a.load();
		audio['S'] = a;
		a = new Audio();
		a.setAttribute("src","audio/no-quiero.wav");
		a.load();
		audio['N'] = a;
		a = new Audio();
		a.setAttribute("src","audio/truco.wav");
		a.load();
		audio['T'] = a;
		a = new Audio();
		a.setAttribute("src","audio/re-truco.wav");
		a.load();
		audio['RT'] = a;
		a = new Audio();
		a.setAttribute("src","audio/vale-cuatro.wav");
		a.load();
		audio['V'] = a;
		//Comienza la acción
		_partidaActual = new Partida();
		_partidaActual.iniciar('Pablo', 'Computadora');
		
	});
	

		
})(window);
