var config = {
	location: {
		index: 'index.html',
		users: './users.json',
		projekt: './projekt.json'
	},
	port: 8888,
	cmd: {
		infowidth: 60,
		infostart: 'Server är startad!',
		infolink: 'Kan nås via följande länkar:',
		infolocal: 'Lokalt',
		infonetw:'Nätverket',
		infoturnoff: 'Stäng av server med "CTRL+C"'
	},
	elemtohide: ['namn', 'projektnamn', 'projekt', 'klocka', 'klockaannantid', 'loggwrapper', 'loggedit', 'skrivut', 'skrivutpapper'],
	projekt: {
		dw: {
			namn: 'Digital Whiteboard'
		},
		mat: {
			namn: 'MatAppen'
		},
		res: {
			namn: 'Resor'
		},
		utb: {
			namn: 'Utbildning/Föreläsning'
		},
		sam: {
			namn: 'Sammordning'
		}
	},
	forklaringar: ['Projekt', 'Datum', 'Tid In', 'Tid Ut', 'Tid Pass', 'Tid Dag', 'Tid Projekt', 'Tid Månad'],
	manader: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
	skrivutfinnsinte: ['XXXXXX', 'XX:XX', 'XX:XX', 'XX:XX:XX', 'XX:XX:XX', 'XX:XX:XX']
};