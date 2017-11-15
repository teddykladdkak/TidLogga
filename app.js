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
			var texttowrite = JSON.parse('{"data": []}');
			fs.writeFile(file, JSON.stringify(texttowrite, null, ' '), (err) => {
				if (err){
					console.log('Något gick fel i skapandet av ny fil.')
				}else{

				};
			});
		};
	});
};

function makedirektory(projekt, vgrid){
	makeDir('users/' + vgrid).then(path => {
		makeDir('users/' + vgrid + '/' + projekt).then(path => {
		});
	});
};


// Loading socket.io
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket, username) {
	// When the client connects, they are sent a message
	socket.emit('message', 'You are connected!');
	socket.on('checkuser', function (vgrid) {
		var finns = checkuser(vgrid, false);
		if(!finns){
			socket.emit('erroranvandare', 'Användare kunde inte hittas: ' + vgrid);
		}else{
			for (var i = finns.projekt.length - 1; i >= 0; i--) {
				makedirektory(finns.projekt[i], finns.vgrid);
			};
			finns.activeprojekt = checkactive(vgrid);
			socket.emit('anvandare', finns);
			socket.broadcast.emit('loggoutuser', finns.vgrid);
		};
	});
	
	socket.on('startadmin', function (vgrid) {
		var finns = checkuser(vgrid, true);
		var allusers = global['allusers'];
		if(!finns){}else{
			socket.emit('admininfo', {"vgrid": vgrid, "data": allusers});
		};
	});
	function checkuser(vgrid, admin){
		var finns = false;
		var allusers = global['allusers'];
		for (var i = allusers.length - 1; i >= 0; i--) {
			if(vgrid == allusers[i].vgrid){
				if(admin){
					var finns = allusers[i].admin;
				}else{
					var finns = allusers[i];
				};
				checkactive(vgrid);
			};
		};
		return finns;
	};
	function addzero(number){if(number <= 9){return "0" + number;}else{return number;};};
	function checkactive(vgrid){
		var allusers = global['allusers'];
		var activeprojekt = [];
		for (var i = allusers.length - 1; i >= 0; i--) {
			if(vgrid == allusers[i].vgrid){
				for (var a = allusers[i].projekt.length - 1; a >= 0; a--) {
					var date = new Date();
						var y = date.getFullYear();
						var m = date.getMonth() + 1;
					var file = 'users/' + vgrid + '/' + allusers[i].projekt[a] + '/' + y + '-' + addzero(m) + '.json';
					if (fs.existsSync(file)) {
						var data = JSON.parse(fs.readFileSync(file, 'utf8'));
						for (var b = data.data.length - 1; b >= 0; b--) {
							if(!data.data[b].ut){
								activeprojekt.push(allusers[i].projekt[a]);
							};
						};
					};
				};
			};
		};
		return activeprojekt;
	};
	socket.on('uppdaterausers', function (askdata) {
		var finns = checkuser(askdata.vgrid, true);
		if(!finns){}else{
			var tosave = {"data": askdata.nyausers};
			fs.writeFile(config.location.users, JSON.stringify(tosave, null, ' '), (err) => {
				if (err){
					console.log('Något gick fel i skapandet av ny fil.')
				}else{
					loadusers();
				};
			});
		};
	});
	socket.on('checkprojekt', function (askdata) {
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
							if(!gammaldata[i].data[a].ut){
								askdata.svar = gammaldata[i].data[a].in;
							};
						};
					};
					socket.emit('svarprojekt', askdata);
				}else if(askdata.getall){
					if(askdata.datum == 'none'){
						askdata.datum = items[items.length - 1].split('.js')[0];
					}else{
						var splitdatum = askdata.datum.split('-');
						askdata.datum = splitdatum[0] + '-' + splitdatum[1];
					};
					askdata.svar = JSON.parse(fs.readFileSync('users/' + askdata.vgrid + '/' + askdata.projekt + '/' + askdata.datum + '.json', 'utf8'));
					var prittydates = [];
					for (var i = 0; i < items.length; i++){
						prittydates.push(items[i].split('.js')[0]);
					};
					askdata.mothtoload = prittydates;
					socket.emit('sendlogg', askdata);
				};
			};
		});
	});
	socket.on('removesegment', function (removedata) {
		var splitdatum = removedata.datum.split('-');
		var file = 'users/' + removedata.vgrid + '/' + removedata.projektid + '/' + splitdatum[0] + '-' + splitdatum[1] + '.json';
		var readdata = JSON.parse(fs.readFileSync(file, 'utf8'));
		var elementtoremove = findelement(readdata, removedata.millisecin, removedata.millisecut);
			readdata.data.splice(elementtoremove,1);
		fs.writeFile(file, JSON.stringify(readdata, null, ' '), (err) => {
			socket.emit('reloadlogg', removedata);
		});
	});
	socket.on('editsegment', function (editdata) {
		var oldsplitdatum = editdata.old.datum.split('-');
		var oldfile = 'users/' + editdata.vgrid + '/' + editdata.projektid + '/' + oldsplitdatum[0] + '-' + oldsplitdatum[1] + '.json';
		var readdata = JSON.parse(fs.readFileSync(oldfile, 'utf8'));
		var elementtoremove = findelement(readdata, editdata.old.millisecin, editdata.old.millisecut);
			readdata.data.splice(elementtoremove,1);
		fs.writeFile(oldfile, JSON.stringify(readdata, null, ' '), (err) => {
			var nysplitdatum = editdata.ny.in.datum.split('-');
			var nyfile = 'users/' + editdata.vgrid + '/' + editdata.projektid + '/' + nysplitdatum[0] + '-' + nysplitdatum[1] + '.json';
			fs.readFile(nyfile, (err, data) => {
				if (err){
					var nydata = {};
						nydata.data = [editdata.ny];
					fs.writeFile(nyfile, JSON.stringify(nydata, null, ' '), (err) => {
						socket.emit('reloadlogg', editdata);
					});
				}else{
					var gammaldata = JSON.parse(data);
						gammaldata.data.push(editdata.ny);
					fs.writeFile(nyfile, JSON.stringify(gammaldata, null, ' '), (err) => {
						if (err){
							console.log('Något gick fel i skapandet av ny fil.')
						}else{
							socket.emit('reloadlogg', editdata);
						};
					});
				};
			});
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
		var datsplit = inklockdata.datum.datum.split('-');
		var file = 'users/' + inklockdata.vgrid + '/' + inklockdata.projekt + '/' + datsplit[0] + '-' + datsplit[1] + '.json';
		fs.readFile(file, (err, data) => {
			if (err){
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
							socket.emit('startaklocka', inklockdata);
						};
					});
				};
			};
		});
	});

	socket.on('stopklocka', function(utklockdata) {
		var datsplit = utklockdata.startdatum.split('-');
		var file = 'users/' + utklockdata.vgrid + '/' + utklockdata.projekt + '/' + datsplit[0] + '-' + datsplit[1] + '.json';
		fs.readFile(file, (err, data) => {
			if (err){
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
						socket.emit('stopklocka', utklockdata);
					};
				});
			};
		});
	});


	socket.on('getfilestoload', function(vgrid) {
		fs.readdir('users/' + vgrid, function(err, projekt) {
			var responsdata = [];
			for (var i = projekt.length - 1; i >= 0; i--) {
				if(projekt[i].split('.').length == 1){
					responsdata.push(projekt[i]);
				};
			};
			socket.emit('responsfilestoload', {"responsdata": responsdata, "vgrid": vgrid});
		});
	});
	socket.on('getdates', function(data) {
		//{"vgrid": vgrid, "responsdata": responsdata}
		for (var i = data.responsdata.length - 1; i >= 0; i--) {
			fs.readdir('users/' + data.vgrid + '/' + data.responsdata[i], function(err, datum) {
				var responsdatum = [];
				for (var i = datum.length - 1; i >= 0; i--) {
					var datumsplit = datum[i].split('.');
					if(datumsplit[1] == 'json'){
						responsdatum.push(datumsplit[0]);
					};
				};
				socket.emit('skrivutadddatum', responsdatum);
			});
		};
	});
	socket.on('getprojektinformaiton', function(data) {
		var datatosend = [];
		for (var i = data.projekttoget.length - 1; i >= 0; i--) {
			var projekt = data.projekttoget[i];
			var file = 'users/' + data.vgrid + '/' + projekt + '/' + data.manad + '.json';
			if (fs.existsSync(file)) {
				datatosend.push({"id": projekt, "data": JSON.parse(fs.readFileSync(file, 'utf8')).data});
			}else{
				datatosend.push({"id": projekt, "data": "none"});
			};
		};
		socket.emit('skrivutinfo', {"data": datatosend, "todo": data.todo, "manad": data.manad});
	});
	socket.on('getpie', function(data) {
		var userinfo = checkuser(data.vgrid, false);
		var datatosend = [];
		var sammanlagt = 0;
		for (var i = userinfo.projekt.length - 1; i >= 0; i--) {
			var datumsplit = data.datum.split('-')
			var file = 'users/' + data.vgrid + '/' + userinfo.projekt[i] + '/' + datumsplit[0] + '-' + datumsplit[1] + '.json';
			if (fs.existsSync(file)) {
				var valuetosend = 0;
				var klockningar = JSON.parse(fs.readFileSync(file, 'utf8')).data;
				for (var a = klockningar.length - 1; a >= 0; a--) {
					if(!klockningar[a].ut){}else{
						var count = parseInt(klockningar[a].ut.milisec) - parseInt(klockningar[a].in.milisec);
						var valuetosend = valuetosend + count;
					};
				};
				var sammanlagt = sammanlagt + valuetosend;
				datatosend.push({"id": userinfo.projekt[i], "val": valuetosend});
			}else{
				datatosend.push({"id": userinfo.projekt[i], "val": 0});
			};
		};
		socket.emit('sendpie', {"data": datatosend, "manad": data.manad, "sammanlagt": sammanlagt});
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