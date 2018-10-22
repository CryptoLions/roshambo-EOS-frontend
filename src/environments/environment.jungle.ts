const chain = '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'; 
export const environment = {
	production: true,
	gcontract: 'rpstester123',
	network : {
    	blockchain: 'eos',
    	host: 'junglehistory.cryptolions.io',
    	port: 18888,
    	protocol: 'http',
    	expireInSeconds: 120,
    	chainId: chain
	},
	chain: chain,
	Eos: {
		httpEndpoint: 'http://junglehistory.cryptolions.io',
		chainId: chain,
		verbose: false
	},
	botName: 'roshamboebot',
	version: '1.1.0'
};