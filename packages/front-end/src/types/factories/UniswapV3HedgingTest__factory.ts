/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UniswapV3HedgingTest,
  UniswapV3HedgingTestInterface,
} from "../UniswapV3HedgingTest";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "collateralAsset",
        type: "address",
      },
    ],
    name: "getBalance",
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
    inputs: [],
    name: "getDelta",
    outputs: [
      {
        internalType: "int256",
        name: "delta",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "_delta",
        type: "int256",
      },
    ],
    name: "hedgeDelta",
    outputs: [
      {
        internalType: "int256",
        name: "deltaChange",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setHedgingReactorAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "uniswapV3HedgingReactor",
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
    name: "update",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610481806100206000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063a2e620451161005b578063a2e62045146100e8578063c549176e146100f0578063f8b2cb4f146100f8578063fbaac1151461010b57600080fd5b8063203df58b146100825780632e1a7d4d146100b25780636cc69817146100d3575b600080fd5b600054610095906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6100c56100c03660046103e9565b61011e565b6040519081526020016100a9565b6100e66100e1366004610402565b610195565b005b6100c56101d4565b6100c5610253565b6100c5610106366004610402565b6102a7565b6100c56101193660046103e9565b6102ee565b60008054604051632e1a7d4d60e01b8152600481018490526001600160a01b0390911690632e1a7d4d906024015b6020604051808303816000875af115801561016b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061018f9190610432565b92915050565b600080546001600160a01b0319166001600160a01b0383161790556101d173a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4882600019610320565b50565b60008060009054906101000a90046001600160a01b03166001600160a01b031663a2e620456040518163ffffffff1660e01b81526004016020604051808303816000875af115801561022a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061024e9190610432565b905090565b60008060009054906101000a90046001600160a01b03166001600160a01b031663c549176e6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561022a573d6000803e3d6000fd5b6040516370a0823160e01b81523060048201526000906001600160a01b038316906370a0823190602401602060405180830381865afa15801561016b573d6000803e3d6000fd5b6000805460405163fbaac11560e01b8152600481018490526001600160a01b039091169063fbaac1159060240161014c565b600060405163095ea7b360e01b81526001600160a01b03841660048201528260248201526000806044836000895af191505061035b816103a2565b61039c5760405162461bcd60e51b815260206004820152600e60248201526d1054141493d59157d1905253115160921b604482015260640160405180910390fd5b50505050565b60003d826103b457806000803e806000fd5b80602081146103cc5780156103dd57600092506103e2565b816000803e600051151592506103e2565b600192505b5050919050565b6000602082840312156103fb57600080fd5b5035919050565b60006020828403121561041457600080fd5b81356001600160a01b038116811461042b57600080fd5b9392505050565b60006020828403121561044457600080fd5b505191905056fea26469706673582212205188c1e98cbd9694427859164be59f645ec2fb36ab8170fe1dce09bab49e79e864736f6c634300080e0033";

type UniswapV3HedgingTestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UniswapV3HedgingTestConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UniswapV3HedgingTest__factory extends ContractFactory {
  constructor(...args: UniswapV3HedgingTestConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<UniswapV3HedgingTest> {
    return super.deploy(overrides || {}) as Promise<UniswapV3HedgingTest>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): UniswapV3HedgingTest {
    return super.attach(address) as UniswapV3HedgingTest;
  }
  connect(signer: Signer): UniswapV3HedgingTest__factory {
    return super.connect(signer) as UniswapV3HedgingTest__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UniswapV3HedgingTestInterface {
    return new utils.Interface(_abi) as UniswapV3HedgingTestInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UniswapV3HedgingTest {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as UniswapV3HedgingTest;
  }
}
