var http = require('http');
var fs = require('fs');
var path = require('path');
const makeDir = require('make-dir');

eval(fs.readFileSync('public/config.js')+'');

//Startar server och tillåtna filer
var server = http.createServer(function (request, response) {
	var filePath = '.' + request.url;
	if (filePath == './') {
		filePath = config.location.index;
	};
	//Här radas alla tillåtna filer
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.json':
			contentType = 'application/json';
			break;
		case '.png':
			contentType = 'image/png';
			break;	  
		case '.jpg':
			contentType = 'image/jpg';
			break;
		case '.ico':
			contentType = 'image/x-icon';
			break;
		case '.wav':
			contentType = 'audio/wav';
			break;
	};
	loadpage(filePath, extname, response, contentType);
});

function loadpage(filePath, extname, response, contentType){
	//Säger till server att läsa och skicka fil till klient (Möjlighet att lägga till felmeddelanden)
	fs.readFile('./public/' + filePath, function(error, content) {
		if (error) {
			if(error.code == 'ENOENT'){
				fs.readFile('./404.html', function(error, content) {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				});
			}
			else {
				response.writeHead(500);
				response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
				response.end(); 
			}
		}
		else {
			response.writeHead(200, { 'Content-Type': contentType });
			response.end(content, 'utf-8');
		}
	});
};




var allusers = [];
function loadusers(){
	//Laddar register där användarnamn är registrerade
	var loadstorednames = JSON.parse(fs.readFileSync(config.location.users, 'utf8'));
	//var storednames = loadstorednames.data;
	global['allusers'] = loadstorednames.data;
};
makefile(config.location.users);
loadusers();



function makefile(file){
	fs.readFile(file, (err, data) => {
		if (err){
			console.log('"' + file + '" finns inte, skapar ny fil.');
			var texttowrite = JSON.parse('{"data": []}');
			fs.writeFile(file, JSON.stringify(texttowrite, null, ' '), (err) => {
				if (err){
					console.log('Något gick fel i skapandet av ny fil.')
				}else{
					console.log('"' + file + '" skapad.');
				};
			});
		};
	});
};

function makedirektory(projekt, vgrid){
	makeDir('users/' + vgrid).then(path => {
		makeDir('users/' + vgrid + '/' + projekt).then(path => {
			console.log(projekt + ' förberedd för VGR ID: ' + vgrid);
		});
	});
};


// Loading socket.io
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket, username) {
	// When the client connects, they are sent a message
	socket.emit('message', 'You are connected!');
	socket.on('checkuser', function (vgrid) {
		var finns = false;
		var allusers = global['allusers'];
		console.log(allusers);
		for (var i = allusers.length - 1; i >= 0; i--) {
			console.log(allusers[i].vgrid);
			if(vgrid == allusers[i].vgrid){
				var finns = allusers[i];
			};
		};
		if(!finns){
			socket.emit('erroranvandare', 'Användare kunde inte hittas: ' + vgrid);
		}else{
			for (var i = finns.projekt.length - 1; i >= 0; i--) {
				makedirektory(finns.projekt[i], finns.vgrid);
			};
			socket.emit('anvandare', finns);
		};
	});
	socket.on('checkprojekt', function (askdata) {
		console.log(askdata);
		/*makeDir('users/' + askdata.vgrid).then(path => {
		    console.log('users/' + askdata.vgrid + '/' + askdata.projekt + '.json');
		    makefile('users/' + askdata.vgrid + '/' + askdata.projekt + '.json');
			fs.readFile('users/' + askdata.vgrid + '/' + askdata.projekt + '.json', (err, data) => {
				if (err){
					console.log('Kunde inte läsa "users/' + askdata.vgrid + '/' + askdata.projekt + '.json".');
				}else{
					var gammaldata = JSON.parse(data);
					if(askdata.getall){
						askdata.svar = gammaldata.data
						socket.emit('sendlogg', askdata);
					}else{
						askdata.svar = 'none';
						for (var i = gammaldata.data.length - 1; i >= 0; i--) {
							if(!gammaldata.data[i].ut){
								askdata.svar = gammaldata.data[i].in;
							};
						};
						socket.emit('svarprojekt', askdata);
					};
				};
			});
		});*/
		//makefile('users/' + askdata.vgrid + '/' + askdata.projekt + '/' + )
		
		var gammaldata = [];
		fs.readdir('users/' + askdata.vgrid + '/' + askdata.projekt, function(err, items) {
			if(items.length == 0){
				askdata.svar = 'none';
				if(askdata.checkaktiv){
					socket.emit('svarprojekt', askdata);
				}else if(askdata.getall){
					socket.emit('sendlogg', askdata);
				};
			}else{
				if(askdata.checkaktiv){
					for (var i=0; i<items.length; i++) {
						gammaldata.push(JSON.parse(fs.readFileSync('users/' + askdata.vgrid + '/' + askdata.projekt + '/' + items[i], 'utf8')));
					};
					askdata.svar = 'none';
					for (var i = gammaldata.length - 1; i >= 0; i--) {
						for (var a = gammaldata[i].data.length - 1; a >= 0; a--) {
							console.log(gammaldata[i].data[a]);
							if(!gammaldata[i].data[a].ut){
								askdata.svar = gammaldata[i].data[a].in;
							};
						};
					};
					socket.emit('svarprojekt', askdata);
				}else if(askdata.getall){
					var splitdatum = askdata.datum.split('-');
					askdata.svar = JSON.parse(fs.readFileSync('users/' + askdata.vgrid + '/' + askdata.projekt + '/' + splitdatum[0] + '-' + splitdatum[1] + '.json', 'utf8'));
					var prittydates = [];
					for (var i = 0; i < items.length; i++){
						prittydates.push(items[i].split('.js')[0]);
					};
					askdata.mothtoload = prittydates;
					socket.emit('sendlogg', askdata);
				};
			}
		});
	});
	socket.on('removesegment', function (removedata) {
		var splitdatum = removedata.datum.split('-');
		var file = 'users/' + removedata.vgrid + '/' + removedata.projektid + '/' + splitdatum[0] + '-' + splitdatum[1] + '.json';
		var readdata = JSON.parse(fs.readFileSync(file, 'utf8'));
		var elementtoremove = findelement(readdata, removedata.millisecin, removedata.millisecut);
			readdata.data.splice(elementtoremove,1);
		fs.writeFile(file, JSON.stringify(readdata, null, ' '), (err) => {
			socket.emit('elementremoved', removedata);
		});
	});
	function findelement(data, millisecin, millisecut){
		var olddata = data.data;
		for (var i = olddata.length - 1; i >= 0; i--) {
			if(millisecut == 'none'){
				if(olddata[i].in.milisec == millisecin){
					if(!olddata[i].ut){
						return i;
					};
				};
			}else{
				if(olddata[i].in.milisec == millisecin){
					if(olddata[i].ut.milisec == millisecut){
						return i;
					};
				};
			};
		};
		return 'none';
	};
	socket.on('klockain', function (inklockdata) {
		var indatumdata = {};
			indatumdata.in = inklockdata.datum;
		console.log(inklockdata.datum.datum);
		var datsplit = inklockdata.datum.datum.split('-');
		var file = 'users/' + inklockdata.vgrid + '/' + inklockdata.projekt + '/' + datsplit[0] + '-' + datsplit[1] + '.json';
		fs.readFile(file, (err, data) => {
			if (err){
				console.log(file + ' kunde inte läsas, skapar ny.');
				var nydata = {};
					nydata.data = [indatumdata];
				fs.writeFile(file, JSON.stringify(nydata, null, ' '), (err) => {
					socket.emit('startaklocka', inklockdata);
				});
			}else{
				var gammaldata = JSON.parse(data);
				if(inklockdata.save){
					socket.emit('startaklocka', inklockdata);
				}else{
					gammaldata.data.push(indatumdata);
					fs.writeFile(file, JSON.stringify(gammaldata, null, ' '), (err) => {
						if (err){
							console.log('Något gick fel i skapandet av ny fil.')
						}else{
							console.log('"' + file + '" ändrad.');
							socket.emit('startaklocka', inklockdata);
						};
					});
				};
			};
		});
	});

	socket.on('stopklocka', function(utklockdata) {
		var datsplit = utklockdata.startdatum.split('-');
		console.log(datsplit);
		var file = 'users/' + utklockdata.vgrid + '/' + utklockdata.projekt + '/' + datsplit[0] + '-' + datsplit[1] + '.json';
		fs.readFile(file, (err, data) => {
			if (err){
				console.log(file + ' kunde inte läsas.');
			}else{
				var gammaldata = JSON.parse(data);
				for (var i = gammaldata.data.length - 1; i >= 0; i--) {
					if(!gammaldata.data[i].ut){
						gammaldata.data[i].ut = utklockdata.datum;
					};
				};
				fs.writeFile(file, JSON.stringify(gammaldata, null, ' '), (err) => {
					if (err){
						console.log('Något gick fel i skapandet av ny fil.')
					}else{
						console.log('"' + file + '" ändrad.');
						socket.emit('stopklocka', utklockdata);
					};
				});
			};
		});
	});
});
//Kollar IP adress för server.
function getIPAddress() {
	var interfaces = require('os').networkInterfaces();
	for (var devName in interfaces) {
		var iface = interfaces[devName];
		for (var i = 0; i < iface.length; i++) {
			var alias = iface[i];
			if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
			return alias.address;
		};
	};
	return '0.0.0.0';
};
var ip = getIPAddress();
console.log(config.cmd.infolocal + ': http://localhost:' + config.port);
console.log(config.cmd.infonetw + ': http://' + ip + ':' + config.port);
server.listen(config.port);