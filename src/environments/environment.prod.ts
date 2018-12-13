const chain = 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'; 
export const environment = {
	production: true,
	gcontract: 'roshambogame',
	network : {
    	blockchain: 'eos',
    	host: 'bp.cryptolions.io',
    	port: 8888,
    	protocol: 'http',
    	expireInSeconds: 120,
    	chainId: chain
	},
	chain: chain,
	Eos: {
		httpEndpoint: 'http://bp.cryptolions.io',
		chainId: chain,
		verbose: false
	},
	botName: 'roshambopunk',
	version: '1.1.0',
	whitepaperUrl: '/whitepaper.pdf',
	style: {
		body: { 
			background: "url('./assets/images/section-background.svg') 50% 17vh no-repeat,linear-gradient(to bottom, #0ba360 0%, #3cba92 100%) 0 0 no-repeat"
		},
		ukLabel: {
			background: "#209362"
		},
		ukButtonPrimary: {
			color: "#209362",
			'box-shadow': '0 10px 40px #0ba360',
			'border': 'none'
		},
		logoText: 'Jungle roshambo',
		title: 'Jungle roshambo EOS game | by Cryptolions'
	}
};

//old gradient linear-gradient(to left top, #218838bf, #218838)