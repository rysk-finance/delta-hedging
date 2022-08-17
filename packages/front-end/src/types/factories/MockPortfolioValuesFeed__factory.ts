/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  Overrides,
  BytesLike,
  BigNumberish,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MockPortfolioValuesFeed,
  MockPortfolioValuesFeedInterface,
} from "../MockPortfolioValuesFeed";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_oracle",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_jobId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_link",
        type: "address",
      },
      {
        internalType: "address",
        name: "_authority",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "NotKeeper",
    type: "error",
  },
  {
    inputs: [],
    name: "UNAUTHORIZED",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract IAuthority",
        name: "authority",
        type: "address",
      },
    ],
    name: "AuthorityUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "underlying",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "strike",
        type: "address",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "delta",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "gamma",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "vega",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "theta",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "callPutsValue",
        type: "int256",
      },
    ],
    name: "DataFullfilled",
    type: "event",
  },
  {
    inputs: [],
    name: "authority",
    outputs: [
      {
        internalType: "contract IAuthority",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_requestId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_underlying",
        type: "address",
      },
      {
        internalType: "address",
        name: "_strike",
        type: "address",
      },
      {
        internalType: "int256",
        name: "_delta",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "_gamma",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "_vega",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "_theta",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "_callPutsValue",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "_spotPrice",
        type: "uint256",
      },
    ],
    name: "fulfill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "underlying",
        type: "address",
      },
      {
        internalType: "address",
        name: "strike",
        type: "address",
      },
    ],
    name: "getPortfolioValues",
    outputs: [
      {
        components: [
          {
            internalType: "int256",
            name: "delta",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "gamma",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "vega",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "theta",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "callPutsValue",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "spotPrice",
            type: "uint256",
          },
        ],
        internalType: "struct Types.PortfolioValues",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
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
    name: "keeper",
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
    inputs: [],
    name: "liquidityPool",
    outputs: [
      {
        internalType: "contract ILiquidityPool",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_underlying",
        type: "address",
      },
      {
        internalType: "address",
        name: "_strike",
        type: "address",
      },
    ],
    name: "requestPortfolioData",
    outputs: [
      {
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_asset",
        type: "address",
      },
      {
        internalType: "string",
        name: "_stringVersion",
        type: "string",
      },
    ],
    name: "setAddressStringMapping",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IAuthority",
        name: "_newAuthority",
        type: "address",
      },
    ],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_keeper",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_auth",
        type: "bool",
      },
    ],
    name: "setKeeper",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_liquidityPool",
        type: "address",
      },
    ],
    name: "setLiquidityPool",
    outputs: [],
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
    name: "stringedAddresses",
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
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_target",
        type: "address",
      },
    ],
    name: "withdrawLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x61010060405260016005553480156200001757600080fd5b5060405162000ef038038062000ef08339810160408190526200003a91620001a9565b600080546001600160a01b0319166001600160a01b03831690811790915560405190815281907f2f658b440c35314f52658ea8a740e05b284cdc84dc9ae01e891f21b8933e7cad9060200160405180910390a1506001600160a01b038216620000ad57620000a7620000eb565b620000c9565b600380546001600160a01b0319166001600160a01b0384161790555b506001600160a01b0393841660805260a09290925260c0521660e0526200022c565b6200018a73c89bd4e1632d3a43cb03aaad5262cbe4038bc5716001600160a01b03166338cc48316040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000142573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000168919062000207565b600380546001600160a01b0319166001600160a01b0392909216919091179055565b565b80516001600160a01b0381168114620001a457600080fd5b919050565b600080600080600060a08688031215620001c257600080fd5b620001cd866200018c565b94506020860151935060408601519250620001eb606087016200018c565b9150620001fb608087016200018c565b90509295509295909350565b6000602082840312156200021a57600080fd5b62000225826200018c565b9392505050565b60805160a05160c05160e051610c936200025d60003960006104ea0152600050506000505060005050610c936000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c8063665a11ca11610071578063665a11ca146101a35780637a9e5e4b146101ce57806380a624f5146101e1578063bf7e214f146101f4578063d1b9e85314610207578063e8cf86081461021a57600080fd5b806301877020146100b957806305c25390146100ce57806307e6e65d146100f45780633926f28e1461010757806341ea27ca146101275780634e133d4d1461013a575b600080fd5b6100cc6100c7366004610984565b61024d565b005b6100e16100dc3660046109a8565b610277565b6040519081526020015b60405180910390f35b6100cc6101023660046109e1565b610287565b61011a610115366004610984565b610422565b6040516100eb9190610a59565b6100cc610135366004610aae565b6104bc565b61014d6101483660046109a8565b61055c565b6040516100eb9190600060e082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015260a083015160a083015260c083015160c083015292915050565b6008546101b6906001600160a01b031681565b6040516001600160a01b0390911681526020016100eb565b6100cc6101dc366004610984565b610615565b6100cc6101ef366004610ae9565b610671565b6000546101b6906001600160a01b031681565b6100cc610215366004610bbb565b6106a2565b61023d610228366004610984565b600a6020526000908152604090205460ff1681565b60405190151581526020016100eb565b6102556106d5565b600880546001600160a01b0319166001600160a01b0392909216919091179055565b600061028161077d565b92915050565b60006040518060e0016040528088815260200187815260200186815260200185815260200184815260200142815260200183815250905080600760008b6001600160a01b03166001600160a01b0316815260200190815260200160002060008a6001600160a01b03166001600160a01b03168152602001908152602001600020600082015181600001556020820151816001015560408201518160020155606082015181600301556080820151816004015560a0820151816005015560c08201518160060155905050600860009054906101000a90046001600160a01b03166001600160a01b0316634da2df786040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156103a057600080fd5b505af11580156103b4573d6000803e3d6000fd5b5050604080518a8152602081018a905290810188905260608101879052608081018690526001600160a01b03808c1693508c1691507fec5da05d5d82ced9f6369cfcc2f9d0cad94c0256c7ac3a81d6681bd57b2c33749060a00160405180910390a350505050505050505050565b6009602052600090815260409020805461043b90610be9565b80601f016020809104026020016040519081016040528092919081815260200182805461046790610be9565b80156104b45780601f10610489576101008083540402835291602001916104b4565b820191906000526020600020905b81548152906001019060200180831161049757829003601f168201915b505050505081565b6104c46106d5565b60405163a9059cbb60e01b81526001600160a01b038281166004830152602482018490527f0000000000000000000000000000000000000000000000000000000000000000169063a9059cbb906044016020604051808303816000875af1158015610533573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105579190610c23565b505050565b61059c6040518060e00160405280600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081525090565b506001600160a01b039182166000908152600760209081526040808320939094168252918252829020825160e081018452815481526001820154928101929092526002810154928201929092526003820154606082015260048201546080820152600582015460a082015260069091015460c082015290565b61061d6106d5565b600080546001600160a01b0319166001600160a01b0383169081179091556040519081527f2f658b440c35314f52658ea8a740e05b284cdc84dc9ae01e891f21b8933e7cad9060200160405180910390a150565b6106796106d5565b6001600160a01b03821660009081526009602090815260409091208251610557928401906108d3565b6106aa6106d5565b6001600160a01b03919091166000908152600a60205260409020805460ff1916911515919091179055565b60008054906101000a90046001600160a01b03166001600160a01b0316630c340a246040518163ffffffff1660e01b8152600401602060405180830381865afa158015610726573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061074a9190610c40565b6001600160a01b0316336001600160a01b03161461077b5760405163075fd2b160e01b815260040160405180910390fd5b565b336000908152600a602052604090205460ff16158015610823575060008054906101000a90046001600160a01b03166001600160a01b0316630c340a246040518163ffffffff1660e01b8152600401602060405180830381865afa1580156107e9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061080d9190610c40565b6001600160a01b0316336001600160a01b031614155b80156108b5575060008054906101000a90046001600160a01b03166001600160a01b031663481c6a756040518163ffffffff1660e01b8152600401602060405180830381865afa15801561087b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061089f9190610c40565b6001600160a01b0316336001600160a01b031614155b1561077b57604051631ea2564f60e31b815260040160405180910390fd5b8280546108df90610be9565b90600052602060002090601f0160209004810192826109015760008555610947565b82601f1061091a57805160ff1916838001178555610947565b82800160010185558215610947579182015b8281111561094757825182559160200191906001019061092c565b50610953929150610957565b5090565b5b808211156109535760008155600101610958565b6001600160a01b038116811461098157600080fd5b50565b60006020828403121561099657600080fd5b81356109a18161096c565b9392505050565b600080604083850312156109bb57600080fd5b82356109c68161096c565b915060208301356109d68161096c565b809150509250929050565b60008060008060008060008060006101208a8c031215610a0057600080fd5b8935985060208a0135610a128161096c565b975060408a0135610a228161096c565b989b979a5097986060810135985060808101359760a0820135975060c0820135965060e08201359550610100909101359350915050565b600060208083528351808285015260005b81811015610a8657858101830151858201604001528201610a6a565b81811115610a98576000604083870101525b50601f01601f1916929092016040019392505050565b60008060408385031215610ac157600080fd5b8235915060208301356109d68161096c565b634e487b7160e01b600052604160045260246000fd5b60008060408385031215610afc57600080fd5b8235610b078161096c565b9150602083013567ffffffffffffffff80821115610b2457600080fd5b818501915085601f830112610b3857600080fd5b813581811115610b4a57610b4a610ad3565b604051601f8201601f19908116603f01168101908382118183101715610b7257610b72610ad3565b81604052828152886020848701011115610b8b57600080fd5b8260208601602083013760006020848301015280955050505050509250929050565b801515811461098157600080fd5b60008060408385031215610bce57600080fd5b8235610bd98161096c565b915060208301356109d681610bad565b600181811c90821680610bfd57607f821691505b602082108103610c1d57634e487b7160e01b600052602260045260246000fd5b50919050565b600060208284031215610c3557600080fd5b81516109a181610bad565b600060208284031215610c5257600080fd5b81516109a18161096c56fea2646970667358221220449f91b4d1804264f22d563426c1fa5ec8c64df08337a5fc8ca4880fe843c5b464736f6c634300080e0033";

type MockPortfolioValuesFeedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockPortfolioValuesFeedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockPortfolioValuesFeed__factory extends ContractFactory {
  constructor(...args: MockPortfolioValuesFeedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _oracle: string,
    _jobId: BytesLike,
    _fee: BigNumberish,
    _link: string,
    _authority: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MockPortfolioValuesFeed> {
    return super.deploy(
      _oracle,
      _jobId,
      _fee,
      _link,
      _authority,
      overrides || {}
    ) as Promise<MockPortfolioValuesFeed>;
  }
  getDeployTransaction(
    _oracle: string,
    _jobId: BytesLike,
    _fee: BigNumberish,
    _link: string,
    _authority: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _oracle,
      _jobId,
      _fee,
      _link,
      _authority,
      overrides || {}
    );
  }
  attach(address: string): MockPortfolioValuesFeed {
    return super.attach(address) as MockPortfolioValuesFeed;
  }
  connect(signer: Signer): MockPortfolioValuesFeed__factory {
    return super.connect(signer) as MockPortfolioValuesFeed__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockPortfolioValuesFeedInterface {
    return new utils.Interface(_abi) as MockPortfolioValuesFeedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockPortfolioValuesFeed {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as MockPortfolioValuesFeed;
  }
}
