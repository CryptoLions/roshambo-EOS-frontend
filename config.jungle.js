var PRODUCTION = false;
var chain = '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'; // mainnet 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'

var network = {
    blockchain: 'eos',
    host: 'junglehistory.cryptolions.io',
    port: 18888,
    protocol: 'http',
    expireInSeconds: 120,
    chainId: chain
};

eos = Eos({
	httpEndpoint: 'http://junglehistory.cryptolions.io:18888',
	chainId: chain,
	verbose: false
});