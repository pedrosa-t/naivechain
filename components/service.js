'use strict';

var stdin = process.openStdin();

class Service {

	constructor(blockchain, connection) {
		this._blockchain = blockchain;
		this._connection = connection;

		let self = this;
		stdin.addListener("data", function(d) {

			var opt = d.toString().trim();
			var x = opt.split(' ');

			if (x[0] == "exit") {
				process.exit(1);
			} else if (x[0] == "search") {

				switch (x[1]) {
					case '--timestamp':
					case '-t':
						var data = x[2]; 
						var composedDateStart = self.validaData(data);
							// Onde validaData() retorna True se "data" estiver no formato correto; 		
						if (composedDateStart) {
							var composedDateEnd;
							if(x[3] == undefined){
								composedDateEnd = new Date(composedDateStart.getTime());
								composedDateEnd.setHours(23);
								composedDateEnd.setMinutes(59);
								composedDateEnd.setSeconds(59);				
							} else{
								composedDateEnd = self.validaData(x[3]);
								if(!composedDateEnd) break;
							}
							let log ="The client ran a log reading: "+opt;
							self._blockchain.addBlock(log,'', 1, self._connection);
							// Onde pesquisaLogData() retorna Log com a data correspondente;
							self.pesquisaLogData(composedDateStart.getTime(), composedDateEnd.getTime());
						} else {
							console.log("Parâmetro data incorreto");
						}
					break;

					case '--public-key-path':
					case '-p': 
						var caminho = x[2];
						// Onde validaCaminho() retorna True se o "caminho" da PK estiver correto; 	
						if (self.validaCaminho(caminho)) {
							let log ="The client ran a log reading: "+opt;
							self._blockchain.addBlock(log,'', 1, self._connection);
							// Onde pesquisaLogPK() retorna Log com a PK correpondente;
							self.pesquisaLogPK(caminho);
						} else {
							console.log("Caminho da Chave Pública incorreto");
						}
					break;

					case '--creator':
					case '-c':
						var criador = x[2];

						var i;
						for(i = 3; x[i] !=  undefined; i++) criador = criador.concat(" ", x[i]);

							// Onde validaCriador() retorna True se o "criador" estiver correto;
						if (self.validaCriador(criador)) {
							// Onde pesquisaLogPK() retorna Log do "criador" correspondente;
							let log ="The client ran a log reading: "+opt;
							self._blockchain.addBlock(log,'', 1, self._connection);
							self.pesquisaLogCriador(criador);
						} else {
							console.log("Criador incorreto");
						} 
					break;

					case '--ip':
					case '-i': 
						var ip = x[2]; 
						// Onde validaIp() retorna True se o "ip" estiver correto;
						if (self.validaIp(ip)) {
							// Onde pesquisaLogIp() retorna Log do "Ip" correspondente;
							let log ="The client ran a log reading: "+opt;
							self._blockchain.addBlock(log,'', 1, self._connection);
							self.pesquisaLogIp(ip);
						} else {
							console.log("Ip incorreto");
						} 
					break;

					case '--help':
					case '-?':
					case '-h':
					default: 
						console.log("\n\nUsage: search <option>");
						console.log("\n\t-t, --timestamp <timestamp start> [<timestamp end>]\n\t\tIf <timestamp start> and <timestamp end> are defined, the command\n\t\treturns all the logs between both dates. If only <timestamp start>\n\t\tis defined, the command returns all the logs of the day.\n\n\t\tThe timestamp needs to be in the following format:\n\t\tdd/mm/yyyy");
						console.log("\n\t-p --public-key-path <public key path>\n\t\tIt returns the logs created using the <public key path>.\n\t\tThe <public key path> must include the full path, the name of the\n\t\tfile and the extension.");
						console.log("\n\t-c --creator <creator name>\n\t\tIt returns the logs created by <creator name>.\n\t\tThe name may have more than one word.");
						console.log("\n\t-i --ip <ip>\n\t\tIt returns the logs created by the ip <ip>.\n\t\tThe ip must be version 4.");
						console.log("\n\t-h -? --help\n\t\tIt shows this information.");
				}
			} else if (x[0] != "search") {
				console.log("\n\nUsage:");
				console.log("\n\tsearch <option>\n\t\tSearch in the blockchain logs according to <option>, it is based\n\t\ton timestamp, creator, ip or public key.");
				console.log("\n\texit\tExit the program.");
				console.log("\n\thelp\tShow this information.");
			}
		});
	}


	validaData(date){
		var matches = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(date);
		if (matches == null) return false;
		var d = matches[1];
		var m = matches[2] - 1;
		var y = matches[3];
		var composedDate = new Date(y, m, d);
		if(composedDate.getDate() == d &&
			composedDate.getMonth() == m &&
			composedDate.getFullYear() == y)
			return composedDate;
		return null;
	}

	validaCaminho(path){
		return fs.existsSync(path);
	}

	validaCriador(criator){
		return typeof(criator) == "string";
	}

	validaIp(ip){
		return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
	}

	printBlockUser(results){
		var i;

		var date;
		for (i = 0; i < results.length; i++) {
			date = new Date(results[i]["timestamp"]).toLocaleString('pt-BR');
			console.log("-----------------");
			console.log("Result #: "+i);
			console.log("Creator: "+results[i]["creator"]);
			console.log("Creation date: "+date);
			console.log("Data: "+results[i]["data"]);
			console.log("IP: "+results[i]["ip"]);
			console.log("Public Key: "+results[i]["publicKey"]);
			console.log("-----------------\n");
		}
	}

	pesquisaLogData(timestampStart, timestampEnd){
		console.log("Follow the result of your search by timestamp");
		let self = this;
		this._this._blockchain.getAllBlocks().then(function (blocks){
			var result = [];
			var i;
			for(i = 1; i < blocks.length; i++){
				
				if(blocks[i]["timestamp"] >= timestampStart && blocks[i]["timestamp"] <= timestampEnd){
					result.push(blocks[i]);
				}
			}

			if(result.length < 1){	
				console.log("No result found");

			} else 
			self.printBlockUser(result);
		});

	}

	pesquisaLogPK(pathPK){
		let self = this;
		console.log("Follow the result of your search by PK");
		try{
			fs.readFile(pathPK, 'utf8', function(err, publicKey){
				if (err) {
					console.log("File not found!");
				} else {
					if(publicKey){

						self._blockchain.getAllBlocks().then(function (blocks){
							var result = [];
							var i;

							for(i = 1; i < blocks.length; i++){

								if(blocks[i]["publicKey"].trim() === publicKey.trim()){
									result.push(blocks[i]);
								}
							}
							if(result.length < 1){	
								console.log("No result found");

							}else 
							self.printBlockUser(result);
						});

					} else{
						console.log("Error on file content");
					}

				}
			});

		}catch(e){
			console.log("Error on reading the file");
		}

	}

	pesquisaLogCriador(creator){
		console.log("Follow the result of your search by creator");
		let self = this;
		this._blockchain.getAllBlocks().then(function (blocks){
			var result = [];
			var i;
			for(i = 1; i < blocks.length; i++){
				
				if(blocks[i]["creator"] === creator){
					result.push(blocks[i]);
				}
			}
			if(result.length < 1){	
				console.log("No result found");

			}else 
			self.printBlockUser(result);
		});
	}

	pesquisaLogIp(ip){
		console.log("Follow the result of your search by IP");
		let self = this;
		this._blockchain.getAllBlocks().then(function (blocks){
			var result = [];
			var i;
			for(i = 1; i < blocks.length; i++){
				
				if(blocks[i]["ip"] === ip){
					result.push(blocks[i]);
				}
			}
			if(result.length < 1){	
				console.log("No result found");

			}else 
			self.printBlockUser(result);
		});
	}
}

module.exports = Service;