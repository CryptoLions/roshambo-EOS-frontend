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
	version: '1.1.0'
};
