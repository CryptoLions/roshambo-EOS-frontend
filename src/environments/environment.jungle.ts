const chain = 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473'; 
export const environment = {
	production: true,
	gcontract: 'roshambogame',
	network : {
    	blockchain: 'eos',
    	host: 'jungle2.cryptolions.io',
    	port: 443,
    	protocol: 'https',
    	expireInSeconds: 120,
    	chainId: chain
	},
	chain: chain,
	Eos: {
		httpEndpoint: 'https://jungle2.cryptolions.io',
		chainId: chain,
		verbose: false
	},
	botName: 'roshamboebot',
	version: '2.0.0',
	style: {
		body: { 
			background: "url('./assets/images/section-background.svg') 50% 17vh no-repeat,linear-gradient(to left top, #218838bf, #218838) 0 0 no-repeat"
		},
		ukLabel: {
			background: "#209362"
		},
		ukButtonPrimary: {
			color: "#209362",
			'box-shadow': 'none',
			'border': '1px solid #209362'
		},
		logoText: 'Jungle roshambo',
		title: 'Jungle roshambo EOS game | by Cryptolions'
	}
};