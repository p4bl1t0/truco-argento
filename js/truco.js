(function(window, undefined) {
	"use strict";
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
	
	Jugador.prototype.getPuntosDeEnvido = function () {
		var pares = { 
			Espada: new Array(),
			Basto: new Array(),
			Oro: new Array(),
			Copa: new Array()
		};
		for (var i = 0; i < this.cartas.length; i++) {
			var carta = this.cartas[i];
			pares[carta.palo].push(carta.puntosEnvido);
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
	
	Jugador.prototype.jugarCarta =  function (numeroDeCarta) {
		
	}
	
	function Partida () {
		this.equipoPrimero = {
			jugador: {},
			puntos: 0,
			esMano: true
		};
		this.equipoSegundo = {
			jugador: {},
			puntos: 0,
			esMano: false
		};
	}
	
	Partida.prototype.iniciar = function () {
		var jugador1 = new Jugador();
		this.equipoPrimero.jugador = jugador1;
		var maquina = new Jugador();
		maquina.esHumano = false;
		this.equipoSegundo.jugador = maquina;
		
		this.repartirCartas(jugador1, maquina);
		
		var _log = document.getElementById("log");
		_log.innerHTML = "<strong>Jugador 1:</strong> ";
		for (var i = 0; i < jugador1.cartas.length; i++) {
			_log.innerHTML +=  " " + jugador1.cartas[i].getNombre() + " ";
		}
		_log.innerHTML += "  Puntos para el envido: " + jugador1.getPuntosDeEnvido();
		_log.innerHTML += "<br /><strong>Maquina:</strong> ";
		for (i = 0; i < maquina.cartas.length; i++) {
			_log.innerHTML +=  " " + maquina.cartas[i].getNombre() + " ";
		}
		_log.innerHTML += "  Puntos para el envido: " + maquina.getPuntosDeEnvido();
	}
	
	Partida.prototype.repartirCartas = function(j1, j2) {
		if(j1 === null || j1 === undefined) {
			j1 = this.equipoPrimero.jugador;
		}
		if(j2 === null || j2 === undefined) {
			j2 = this.equipoSegundo.jugador;
		}
		var maso = this.generarBaraja();
		for (var i = 1; i <= 6; i++) {
			var index = getRandomInt(0, maso.length);
			if(i % 2 === 0) {
				j2.cartas.push(maso[index]);
			} else {
				j1.cartas.push(maso[index]);
			}
			maso.splice(index, 1);
		}
		
	}
	
	Partida.prototype.generarBaraja = function () {
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
	
	$(document).ready(function (){
		//Comienza la acción
		var partida = new Partida();
		partida.iniciar();	
	});
		
})(window);
