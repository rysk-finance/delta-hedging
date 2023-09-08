export const UserPositionLensMK1ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_addressbook",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "addressbook",
		"outputs": [
			{
				"internalType": "contract AddressBookInterface",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getVaultsForUser",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "vaultId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "shortOtoken",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "hasLongOtoken",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "longOtoken",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "collateralAsset",
						"type": "address"
					}
				],
				"internalType": "struct UserPositionLensMK1.VaultDrill[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "shortOtoken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "longOtoken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "collateralAsset",
				"type": "address"
			}
		],
		"name": "getVaultsForUserAndOtoken",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;
