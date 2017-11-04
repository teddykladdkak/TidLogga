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
	elemtohide: [/*'namn', 'projektnamn', 'projekt', 'klocka', 'klockaannantid'*/],
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
	}
};