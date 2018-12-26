// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const chain = 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473';  //const chain = 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'; 
export const environment = {
	production: false,
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
			'box-shadow': '0px 1px 10px #0ba360',
			'border': 'none'
		},
		logoText: 'Jungle roshambo',
		title: 'Jungle roshambo EOS game | by Cryptolions'
	}
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
