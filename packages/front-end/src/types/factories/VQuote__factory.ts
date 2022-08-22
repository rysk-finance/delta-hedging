/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  Overrides,
  BigNumberish,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { VQuote, VQuoteInterface } from "../VQuote";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Unauthorised",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vPoolWrapper",
        type: "address",
      },
    ],
    name: "authorize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isAuth",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60a06040523480156200001157600080fd5b50604051620010b2380380620010b28339810160408190526200003491620001d2565b604080518082018252601e81527f52616765205472616465205669727475616c2051756f746520546f6b656e00006020808301918252835180850190945260068452657651756f746560d01b90840152815191929162000097916003916200012c565b508051620000ad9060049060208401906200012c565b505050620000ca620000c4620000d660201b60201c565b620000da565b60ff166080526200023a565b3390565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b8280546200013a90620001fe565b90600052602060002090601f0160209004810192826200015e5760008555620001a9565b82601f106200017957805160ff1916838001178555620001a9565b82800160010185558215620001a9579182015b82811115620001a95782518255916020019190600101906200018c565b50620001b7929150620001bb565b5090565b5b80821115620001b75760008155600101620001bc565b600060208284031215620001e557600080fd5b815160ff81168114620001f757600080fd5b9392505050565b600181811c908216806200021357607f821691505b6020821081036200023457634e487b7160e01b600052602260045260246000fd5b50919050565b608051610e5c6200025660003960006101ab0152610e5c6000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c806370a08231116100a2578063a457c2d711610071578063a457c2d714610264578063a9059cbb14610277578063b6a5d7de1461028a578063dd62ed3e1461029d578063f2fde38b146102b057600080fd5b806370a0823114610210578063715018a6146102395780638da5cb5b1461024157806395d89b411461025c57600080fd5b80632520e7ff116100e95780632520e7ff14610181578063313ce567146101a457806339509351146101d557806340c10f19146101e857806342966c68146101fd57600080fd5b806306fdde031461011b578063095ea7b31461013957806318160ddd1461015c57806323b872dd1461016e575b600080fd5b6101236102c3565b6040516101309190610c62565b60405180910390f35b61014c610147366004610cd3565b610355565b6040519015158152602001610130565b6002545b604051908152602001610130565b61014c61017c366004610cfd565b61036d565b61014c61018f366004610d39565b60066020526000908152604090205460ff1681565b60405160ff7f0000000000000000000000000000000000000000000000000000000000000000168152602001610130565b61014c6101e3366004610cd3565b610391565b6101fb6101f6366004610cd3565b6103b3565b005b6101fb61020b366004610d5b565b6103f1565b61016061021e366004610d39565b6001600160a01b031660009081526020819052604090205490565b6101fb6103fe565b6005546040516001600160a01b039091168152602001610130565b610123610412565b61014c610272366004610cd3565b610421565b61014c610285366004610cd3565b6104a1565b6101fb610298366004610d39565b6104af565b6101606102ab366004610d74565b6104db565b6101fb6102be366004610d39565b610506565b6060600380546102d290610da7565b80601f01602080910402602001604051908101604052809291908181526020018280546102fe90610da7565b801561034b5780601f106103205761010080835404028352916020019161034b565b820191906000526020600020905b81548152906001019060200180831161032e57829003601f168201915b5050505050905090565b60003361036381858561057c565b5060019392505050565b60003361037b8582856106a1565b61038685858561071b565b506001949350505050565b6000336103638185856103a483836104db565b6103ae9190610df7565b61057c565b3360009081526006602052604090205460ff166103e357604051636bd1573560e11b815260040160405180910390fd5b6103ed82826108f4565b5050565b6103fb33826109df565b50565b610406610b36565b6104106000610b90565b565b6060600480546102d290610da7565b6000338161042f82866104db565b9050838110156104945760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084015b60405180910390fd5b610386828686840361057c565b60003361036381858561071b565b6104b7610b36565b6001600160a01b03166000908152600660205260409020805460ff19166001179055565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b61050e610b36565b6001600160a01b0381166105735760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b606482015260840161048b565b6103fb81610b90565b6001600160a01b0383166105de5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b606482015260840161048b565b6001600160a01b03821661063f5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b606482015260840161048b565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b60006106ad84846104db565b9050600019811461071557818110156107085760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000604482015260640161048b565b610715848484840361057c565b50505050565b6001600160a01b03831661077f5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b606482015260840161048b565b6001600160a01b0382166107e15760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b606482015260840161048b565b6107ec838383610be2565b6001600160a01b038316600090815260208190526040902054818110156108645760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b606482015260840161048b565b6001600160a01b0380851660009081526020819052604080822085850390559185168152908120805484929061089b908490610df7565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516108e791815260200190565b60405180910390a3610715565b6001600160a01b03821661094a5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640161048b565b61095660008383610be2565b80600260008282546109689190610df7565b90915550506001600160a01b03821660009081526020819052604081208054839290610995908490610df7565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6001600160a01b038216610a3f5760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b606482015260840161048b565b610a4b82600083610be2565b6001600160a01b03821660009081526020819052604090205481811015610abf5760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b606482015260840161048b565b6001600160a01b0383166000908152602081905260408120838303905560028054849290610aee908490610e0f565b90915550506040518281526000906001600160a01b038516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90602001610694565b505050565b6005546001600160a01b031633146104105760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161048b565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b0383161580610bff57506001600160a01b038216155b80610c2257506001600160a01b03831660009081526006602052604090205460ff165b80610c4557506001600160a01b03821660009081526006602052604090205460ff165b610b3157604051636bd1573560e11b815260040160405180910390fd5b600060208083528351808285015260005b81811015610c8f57858101830151858201604001528201610c73565b81811115610ca1576000604083870101525b50601f01601f1916929092016040019392505050565b80356001600160a01b0381168114610cce57600080fd5b919050565b60008060408385031215610ce657600080fd5b610cef83610cb7565b946020939093013593505050565b600080600060608486031215610d1257600080fd5b610d1b84610cb7565b9250610d2960208501610cb7565b9150604084013590509250925092565b600060208284031215610d4b57600080fd5b610d5482610cb7565b9392505050565b600060208284031215610d6d57600080fd5b5035919050565b60008060408385031215610d8757600080fd5b610d9083610cb7565b9150610d9e60208401610cb7565b90509250929050565b600181811c90821680610dbb57607f821691505b602082108103610ddb57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b60008219821115610e0a57610e0a610de1565b500190565b600082821015610e2157610e21610de1565b50039056fea26469706673582212205527bd068f91822ffeb2b3099e3b9cffb0f688bda4f649fbe6d62a89be6744db64736f6c634300080e0033";

type VQuoteConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VQuoteConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VQuote__factory extends ContractFactory {
  constructor(...args: VQuoteConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    decimals_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<VQuote> {
    return super.deploy(decimals_, overrides || {}) as Promise<VQuote>;
  }
  getDeployTransaction(
    decimals_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(decimals_, overrides || {});
  }
  attach(address: string): VQuote {
    return super.attach(address) as VQuote;
  }
  connect(signer: Signer): VQuote__factory {
    return super.connect(signer) as VQuote__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VQuoteInterface {
    return new utils.Interface(_abi) as VQuoteInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): VQuote {
    return new Contract(address, _abi, signerOrProvider) as VQuote;
  }
}
