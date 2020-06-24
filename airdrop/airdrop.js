var abi = [
	{
		constant: true,
		inputs: [
			{
				internalType: 'address',
				name: '_user',
				type: 'address'
			}
		],
		name: 'balanceOf',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	}
];
var address = '0x61cDb66e56FAD942a7b5cE3F419FfE9375E31075';
var RAIN = web3.eth.contract(abi).at(address);

var faucetContract = '0x6aE67eaF12E4118CD6896Bb19f524476Da696825';

function init() {
	if (window.ethereum !== undefined) {
		window.ethereum.enable();
	}

	$('#claim').click(function() {
		web3.eth.sendTransaction({ to: faucetContract, gas: 120000 }, function(
			error,
			hash
		) {
			if (!error) {
				console.log(hash);
			} else {
				console.log(error);
			}
		});
	});

	var filter = web3.eth.filter('latest');
	filter.watch(function(error, result) {
		update();
	});
	update();
}

function update() {
	RAIN.balanceOf.call(faucetContract, function(error, balance) {
		if (!error) {
			$('#faucetBalance').text(
				formatNumber(parseFloat(web3.fromWei(balance, 'ether')), 5)
			);
		} else {
			console.log(error);
		}
	});
}

function log10(val) {
	return Math.log(val) / Math.log(10);
}

function formatNumber(n, maxDecimals) {
	var zeroes = Math.floor(log10(Math.abs(n)));
	var postfix = '';
	if (zeroes >= 9) {
		postfix = 'B';
		n /= 1e9;
		zeroes -= 9;
	} else if (zeroes >= 6) {
		postfix = 'M';
		n /= 1e6;
		zeroes -= 6;
	}

	zeroes = Math.min(maxDecimals, maxDecimals - zeroes);

	return (
		n.toLocaleString(undefined, {
			minimumFractionDigits: 0,
			maximumFractionDigits: Math.max(zeroes, 0)
		}) + postfix
	);
}

$(document).ready(init);
