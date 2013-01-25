(function( window, undefined ) {
	function Naipe () {
		this.valor = 0;
		this.puntosEnvido = 0;
		this.numero = 0;
		this.palo = '';
		this.nombre = '';
	}
	Naipe.prototype.getValor = function () {
		return this.valor;
	};
	var uno = new Naipe();
	uno.valor = 1;
	var dos = new Naipe();
	dos.valor = 2;
	alert(uno.valor);
	alert(dos.getValor());
	
})(window);
