var config = {
	location: {
		index: 'index.html',
		users: './users.json',
		projekt: './projekt.json'
	},
	port: 7788,
	cmd: {
		infowidth: 60,
		infostart: 'Server är startad!',
		infolink: 'Kan nås via följande länkar:',
		infolocal: 'Lokalt',
		infonetw:'Nätverket',
		infoturnoff: 'Stäng av server med "CTRL+C"'
	},
	elemtohide: ['namn', 'projektnamn', 'projekt', 'klocka', 'klockaannantid', 'loggwrapper', 'loggedit', 'skrivut', 'skrivutpapper', 'admin'],
	projektarray: [{
		id: 'dw',
		namn: 'Digital Whiteboard'
	}, {
		id: 'mat',
		namn: 'MatAppen'
	}, {
		id: 'res',
		namn: 'Resor'
	}, {
		id: 'utb',
		namn: 'Utbildning/Föreläsning'
	}, {
		id: 'sam',
		namn: 'Sammordning'
	}, {
		id: 'patplatt',
		namn: 'Vinnova Patientplatta'
	}, {
		id: 'person',
		namn: 'Personallista'
	}, {
		id: 'kog',
		namn: 'Kom & Gå'
	}, {
		id: 'kcal',
		namn: 'Kaloriräknare'
	}, {
		id: 'slut',
		namn: 'Slutanteckning'
	}, {
		id: 'vtsk',
		namn: 'Vätskelista'
	}, {
		id: 'remiss',
		namn: 'Remiss'
	}, {
		id: 'utskriv',
		namn: 'Utskrivning'
	}, {
		id: 'piller',
		namn: 'Pillerräknaren'
	}],
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
		},
		patplatt: {
			namn: 'Vinnova Patientplatta'
		},
		person: {
			namn: 'Personallista'
		},
		kog: {
			namn: 'Kom & Gå'
		},
		kcal: {
			namn: 'Kaloriräknare'
		},
		slut: {
			namn: 'Slutanteckning'
		},
		vtsk: {
			namn: 'Vätskelista'
		},
		remiss: {
			namn: 'Remiss'
		},
		utskriv: {
			namn: 'Utskrivning'
		},
		piller: {
			namn: 'Pillerräknaren'
		}
	},
	forklaringar: ['Projekt', 'Datum', 'Tid In', 'Tid Ut', 'Tid Pass', 'Tid Dag', 'Tid Projekt', 'Tid Månad'],
	manader: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
	skrivutfinnsinte: ['XXXXXX', 'XX:XX', 'XX:XX', 'XX:XX:XX', 'XX:XX:XX', 'XX:XX:XX']
};