const chain = 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'; 
export const environment = {
	production: true,
	gcontract: 'roshambogame',
	network : {
    	blockchain: 'eos',
    	host: 'bp.cryptolions.io',
    	port: 443,
    	protocol: 'https',
    	expireInSeconds: 120,
    	chainId: chain
	},
	chain: chain,
	Eos: {
		httpEndpoint: 'https://bp.cryptolions.io',
		chainId: chain,
		verbose: false
	},
	botName: 'roshambopunk',
	version: '1.1.0',
	whitepaperUrl: '/conceptpaper.pdf',
	style: {
		body: { 
			background: "transparent" // "url('./assets/images/section-background.svg') 50% 17vh no-repeat,linear-gradient(to bottom, #0ba360 0%, #3cba92 100%) 0 0 no-repeat"
		},
		ukLabel: {
			background: "#209362"
		},
		ukButtonPrimary: {
			color: "#209362",
			'box-shadow': '0px 1px 10px #0ba360',
			'border': 'none'
		},
		logoText: 'Jungle roshambo',
		title: 'Jungle roshambo EOS game | by Cryptolions'
	}
};

//old gradient linear-gradient(to left top, #218838bf, #218838)