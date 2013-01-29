(function(window, undefined) {
	'use strict';
	//Funciones Primitivas
	function getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}	
	
	//Objetos
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
	
	Naipe.prototype.getNombre = function () {
		return this.numero + ' de ' + this.palo;
	};
	
	function Jugador () {
		this.cartas = new Array();
		this.cartasEnMano = new Array();
		this.cartasJugadas = new Array();
		this.esHumano = true;
		this.nombre = '';
	}
	
	Jugador.prototype.sayCartasEnMano = function () {
		var _log = document.getElementById('log');
		_log.innerHTML += '<br /><strong>' + this.nombre + ':</strong><ol> ';
		for (var i = 0; i < this.cartasEnMano.length; i++) {
			if(this.cartasEnMano[i] !== undefined) {
				_log.innerHTML +=  '<li> ' + this.cartasEnMano[i].getNombre() + '<li> ';
			}
		}
		_log.innerHTML += '</ol>';
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
			var _log = document.getElementById('log');
			_log.innerHTML += '<br /> <b>' + this.nombre + ' juega un :</b> ' + this.cartasEnMano[indice].getNombre();
			this.cartasJugadas.push(this.cartasEnMano[indice]);
			this.cartasEnMano.splice(indice,1);
		} else {
			//Logica para que la máquina juegue una carta
		}
	}
	
	function Ronda (equipo1, equipo2) {
		this.equipoPrimero = equipo1;
		this.equipoSegundo = equipo2;
	}
	
	Ronda.prototype.iniciar = function () {
		var _log = document.getElementById('log');
		var c = this.repartirCartas(this.equipoPrimero.jugador, this.equipoSegundo.jugador);
		_log.innerHTML += '<strong>Número de cartas en el maos:</strong> ' + c +' naipes. <br />';
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
		var maso = this.generarBaraja();
		for (var i = 1; i <= 6; i++) {
			var _log = document.getElementById('log');
			var index = getRandomInt(0, (maso.length - 1));
			if(i % 2 === 0) {
				j2.cartas.push(maso[index]);
				j2.cartasEnMano.push(maso[index]);
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
	
	Ronda.prototype.determinarGanadorMano = function (indice) {
		var j1 = this.equipoPrimero.jugador;
		var j2 = this.equipoSegundo.jugador;
		if (j1.cartasJugadas[indice].valor > j2.cartasJugadas[indice].valor) {
			this.equipoPrimero.manos = this.equipoPrimero.manos + 1;
			return j1;
		} else {
			if (j1.cartasJugadas[indice].valor < j2.cartasJugadas[indice].valor) {
				this.equipoSegundo.manos = this.equipoSegundo.manos + 1;
				return j2;
			} else {
				this.equipoPrimero.manos = this.equipoPrimero.manos + 1;
				this.equipoSegundo.manos = this.equipoSegundo.manos + 1;
				return null;
			}
		}
	}
	Ronda.prototype.determinarGanadorRonda = function () {
		var e1 = this.equipoPrimero;
		var e2 = this.equipoSegundo;
		if(e1.manos == e2.manos && e1.manos == 3) {
			//PARDAMOS las tres, gana el mano
			if(e1.esMano) {
				return e1.jugador;
			} else {
				return e2.jugador;
			}	
		} else {
			if(e1.manos == 2 && e1.manos > e2.manos) {
				return e1.jugador;
			} else {
				if(e2.manos == 2 && e2.manos > e1.manos) {
					return e2.jugador;
				} else {
					//Sin ganador
					return null;
				}
			}
		}
		
		if(e1.manos >= 2 && e2.manos < e1.manos) {
			return e1.jugador;
		} else {
			if(e2.manos >= 2 && e1.manos < e2.manos) {
				return e2.jugador;
			} else {
				if(e1.manos == e2.manos === 3) {
					//Pardamos las tres, que complicado
					if(e1.esMano) {
						return e1.jugador;
					} else {
						return e2.jugador;
					}
				} else {
					return null;
				}
				
			}
		}
	}
	function Partida () {
		this.equipoPrimero = {
			jugador: {},
			puntos: 0,
			esMano: true,
			manos: 0
		};
		this.equipoSegundo = {
			jugador: {},
			puntos: 0,
			esMano: false,
			manos: 0
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
		var maquina = new Jugador();
		maquina.esHumano = false;
		if(nombreJugadorDos !== null && nombreJugadorDos !== undefined && nombreJugadorDos !== '') {
			maquina.nombre = nombreJugadorDos;
		} else {
			maquina.nombre = 'Maquina';
		}
		this.equipoSegundo.jugador = maquina;
		
		var ronda = new Ronda(this.equipoPrimero, this.equipoSegundo);
		ronda.iniciar();
				
		var _log = document.getElementById('log');
		jugador1.sayCartasEnMano();
		
		_log.innerHTML += '  Puntos para el envido: ' + jugador1.getPuntosDeEnvido();
		
		maquina.sayCartasEnMano();
		_log.innerHTML += '  Puntos para el envido: ' + maquina.getPuntosDeEnvido();
		
		jugador1.jugarCarta(1);
		
		maquina.jugarCarta(2);
		var ganadorMano = ronda.determinarGanadorMano(0);
		_log.innerHTML += '<br />  Resultado Jugada: ' + (ganadorMano !== null ? ganadorMano.nombre : 'PARDA');
		
		var ganador = ronda.determinarGanadorRonda();
		
		if(ganador === null) {
		
			jugador1.jugarCarta(0);
			maquina.jugarCarta(1);
			var ganadorMano = ronda.determinarGanadorMano(1);
			_log.innerHTML += ' <br /> Resultado Jugada: ' + (ganadorMano !== null ? ganadorMano.nombre : 'PARDA');
			ganador = ronda.determinarGanadorRonda();
			if(ganador === null) {
								
				jugador1.jugarCarta(0);
				maquina.jugarCarta(0);
				
				var ganadorMano = ronda.determinarGanadorMano(0);
				_log.innerHTML += '<br />  Resultado Jugada: ' + (ganadorMano !== null ? ganadorMano.nombre : 'PARDA');
				
			}
		}
		ganador = ronda.determinarGanadorRonda();
		if(ganador !== null) {
			_log.innerHTML += '<br />  Resultado Ronda: ' + ronda.determinarGanadorRonda().nombre;
		}	
		
	}
	
	
	$(document).ready(function (){
		//Comienza la acción
		var partida = new Partida();
		partida.iniciar('Pablo', 'Computadora');
		
	});
		
})(window);
