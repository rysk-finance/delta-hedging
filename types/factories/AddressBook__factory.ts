/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { AddressBook, AddressBookInterface } from "../AddressBook";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "add",
        type: "address",
      },
    ],
    name: "AddressAdded",
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
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
    ],
    name: "ProxyCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
    ],
    name: "getAddress",
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
    name: "getController",
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
    name: "getLiquidationManager",
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
    name: "getMarginCalculator",
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
    name: "getMarginPool",
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
    name: "getOracle",
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
    name: "getOtokenFactory",
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
    name: "getOtokenImpl",
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
    name: "getWhitelist",
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
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_controller",
        type: "address",
      },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_liquidationManager",
        type: "address",
      },
    ],
    name: "setLiquidationManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_marginCalculator",
        type: "address",
      },
    ],
    name: "setMarginCalculator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_marginPool",
        type: "address",
      },
    ],
    name: "setMarginPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_oracle",
        type: "address",
      },
    ],
    name: "setOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_otokenFactory",
        type: "address",
      },
    ],
    name: "setOtokenFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_otokenImpl",
        type: "address",
      },
    ],
    name: "setOtokenImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_whitelist",
        type: "address",
      },
    ],
    name: "setWhitelist",
    outputs: [],
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
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_id",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_newAddress",
        type: "address",
      },
    ],
    name: "updateImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060006100246001600160e01b0361007316565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a350610077565b3390565b611380806100866000396000f3fe608060405234801561001057600080fd5b50600436106101425760003560e01c806392eefe9b116100b8578063d01f63f51161007c578063d01f63f5146102d8578063d94f323e146102e0578063e7cf784114610306578063e9f2e8be1461032c578063ee8a463214610352578063f2fde38b1461035a57610142565b806392eefe9b14610250578063a8de41d514610276578063b508ac991461027e578063ca446dd9146102a4578063cf28493f146102d057610142565b8063715018a61161010a578063715018a6146101e457806375486342146101ec5780637adbf973146101f4578063833b1fce1461021a578063854cff2f146102225780638da5cb5b1461024857610142565b80631ffaf0db1461014757806321f8a7211461016b5780632b6bfeaa146101885780633018205f146101b657806338f92fc7146101be575b600080fd5b61014f610380565b604080516001600160a01b039092168252519081900360200190f35b61014f6004803603602081101561018157600080fd5b50356103b4565b6101b46004803603604081101561019e57600080fd5b50803590602001356001600160a01b03166103cf565b005b61014f610646565b6101b4600480360360208110156101d457600080fd5b50356001600160a01b0316610671565b6101b46106fe565b61014f6107a0565b6101b46004803603602081101561020a57600080fd5b50356001600160a01b03166107cc565b61014f610849565b6101b46004803603602081101561023857600080fd5b50356001600160a01b0316610870565b61014f6108f0565b6101b46004803603602081101561026657600080fd5b50356001600160a01b03166108ff565b61014f610980565b6101b46004803603602081101561029457600080fd5b50356001600160a01b03166109ac565b6101b4600480360360408110156102ba57600080fd5b50803590602001356001600160a01b0316610a2a565b61014f610adb565b61014f610b0d565b6101b4600480360360208110156102f657600080fd5b50356001600160a01b0316610b37565b6101b46004803603602081101561031c57600080fd5b50356001600160a01b0316610bbc565b6101b46004803603602081101561034257600080fd5b50356001600160a01b0316610c3e565b61014f610cc6565b6101b46004803603602081101561037057600080fd5b50356001600160a01b0316610cfa565b604080516d4f544f4b454e5f464143544f525960901b8152905190819003600e0190206000906103af906103b4565b905090565b6000908152600160205260409020546001600160a01b031690565b6103d7610df2565b6000546001600160a01b03908116911614610427576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b6000610432836103b4565b90506001600160a01b0381166105dc5760603061044d6108f0565b604080516001600160a01b0393841660248201529190921660448083019190915282518083039091018152606490910182526020810180516001600160e01b031663485cc95560e01b17905290519091506000906104aa90610df6565b604051809103906000f0801580156104c6573d6000803e3d6000fd5b5090506104d38582610a2a565b6040516001600160a01b0382169086907f1eb35cb4b5bbb23d152f3b4016a5a46c37a07ae930ed0956aba951e23114243890600090a36040805163278f794360e11b81526001600160a01b03868116600483019081526024830193845285516044840152855191851693634f1ef2869389938893929160640190602085019080838360005b83811015610570578181015183820152602001610558565b50505050905090810190601f16801561059d5780820380516001836020036101000a031916815260200191505b509350505050600060405180830381600087803b1580156105bd57600080fd5b505af11580156105d1573d6000803e3d6000fd5b505050505050610641565b60408051631b2ce7f360e11b81526001600160a01b03848116600483015291518392831691633659cfe691602480830192600092919082900301818387803b15801561062757600080fd5b505af115801561063b573d6000803e3d6000fd5b50505050505b505050565b604080516921a7a72a2927a62622a960b11b8152905190819003600a0190206000906103af906103b4565b610679610df2565b6000546001600160a01b039081169116146106c9576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b60408051722624a8aaa4a220aa24a7a72fa6a0a720a3a2a960691b815290519081900360130190206106fb9082610a2a565b50565b610706610df2565b6000546001600160a01b03908116911614610756576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b604080516a13505491d25397d413d3d360aa1b8152905190819003600b0190206000906103af906103b4565b6107d4610df2565b6000546001600160a01b03908116911614610824576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b60408051654f5241434c4560d01b815290519081900360060190206106fb9082610a2a565b60408051654f5241434c4560d01b815290519081900360060190206000906103af906103b4565b610878610df2565b6000546001600160a01b039081169116146108c8576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b604080516815d2125511531254d560ba1b815290519081900360090190206106fb9082610a2a565b6000546001600160a01b031690565b610907610df2565b6000546001600160a01b03908116911614610957576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b604080516921a7a72a2927a62622a960b11b8152905190819003600a0190206106fb90826103cf565b604080516a13d513d2d15397d253541360aa1b8152905190819003600b0190206000906103af906103b4565b6109b4610df2565b6000546001600160a01b03908116911614610a04576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b604080516a13d513d2d15397d253541360aa1b8152905190819003600b0190206106fb90825b610a32610df2565b6000546001600160a01b03908116911614610a82576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b60008281526001602052604080822080546001600160a01b0319166001600160a01b0385169081179091559051909184917f3eb532562a19423f49e2e3b30790b23d00c625f3ee37c7359d03688bf7111f6c9190a35050565b604080517026a0a923a4a72fa1a0a621aaa620aa27a960791b815290519081900360110190206000906103af906103b4565b604080516815d2125511531254d560ba1b815290519081900360090190206000906103af906103b4565b610b3f610df2565b6000546001600160a01b03908116911614610b8f576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b604080516d4f544f4b454e5f464143544f525960901b8152905190819003600e0190206106fb9082610a2a565b610bc4610df2565b6000546001600160a01b03908116911614610c14576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b604080516a13505491d25397d413d3d360aa1b8152905190819003600b0190206106fb9082610a2a565b610c46610df2565b6000546001600160a01b03908116911614610c96576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b604080517026a0a923a4a72fa1a0a621aaa620aa27a960791b815290519081900360110190206106fb9082610a2a565b60408051722624a8aaa4a220aa24a7a72fa6a0a720a3a2a960691b815290519081900360130190206000906103af906103b4565b610d02610df2565b6000546001600160a01b03908116911614610d52576040805162461bcd60e51b8152602060048201819052602482015260008051602061132b833981519152604482015290519081900360640190fd5b6001600160a01b038116610d975760405162461bcd60e51b81526004018080602001828103825260268152602001806113056026913960400191505060405180910390fd5b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b3390565b61050180610e048339019056fe608060405234801561001057600080fd5b50610023336001600160e01b0361002816565b61005d565b604080517f6f72672e7a657070656c696e6f732e70726f78792e6f776e65720000000000008152905190819003601a01902055565b6104958061006c6000396000f3fe60806040526004361061004a5760003560e01c8063025313a21461008e5780633659cfe6146100bf5780634f1ef286146100f45780635c60da1b14610174578063f1739cae14610189575b60006100546101bc565b90506001600160a01b03811661006957600080fd5b60405136600082376000803683855af43d806000843e81801561008a578184f35b8184fd5b34801561009a57600080fd5b506100a36101df565b604080516001600160a01b039092168252519081900360200190f35b3480156100cb57600080fd5b506100f2600480360360208110156100e257600080fd5b50356001600160a01b0316610215565b005b6100f26004803603604081101561010a57600080fd5b6001600160a01b03823516919081019060408101602082013564010000000081111561013557600080fd5b82018360208201111561014757600080fd5b8035906020019184600183028401116401000000008311171561016957600080fd5b509092509050610246565b34801561018057600080fd5b506100a36101bc565b34801561019557600080fd5b506100f2600480360360208110156101ac57600080fd5b50356001600160a01b03166102ed565b600080604051808061043d60239139604051908190036023019020549392505050565b604080517f6f72672e7a657070656c696e6f732e70726f78792e6f776e65720000000000008152905190819003601a0190205490565b61021d6101df565b6001600160a01b0316336001600160a01b03161461023a57600080fd5b61024381610379565b50565b61024e6101df565b6001600160a01b0316336001600160a01b03161461026b57600080fd5b61027483610215565b6000306001600160a01b0316348484604051808383808284376040519201945060009350909150508083038185875af1925050503d80600081146102d4576040519150601f19603f3d011682016040523d82523d6000602084013e6102d9565b606091505b50509050806102e757600080fd5b50505050565b6102f56101df565b6001600160a01b0316336001600160a01b03161461031257600080fd5b6001600160a01b03811661032557600080fd5b7f5a3e66efaa1e445ebd894728a69d6959842ea1e97bd79b892797106e270efcd961034e6101df565b604080516001600160a01b03928316815291841660208301528051918290030190a1610243816103e5565b60006103836101bc565b9050816001600160a01b0316816001600160a01b031614156103a457600080fd5b6103ad8261041a565b6040516001600160a01b038316907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a25050565b604080517f6f72672e7a657070656c696e6f732e70726f78792e6f776e65720000000000008152905190819003601a01902055565b6000604051808061043d6023913960405190819003602301902092909255505056fe6f72672e7a657070656c696e6f732e70726f78792e696d706c656d656e746174696f6ea2646970667358221220feb30e93afb52e2632287066691fcec9524c377f671fcfaa255ecee75a8cbcef64736f6c634300060a00334f776e61626c653a206e6577206f776e657220697320746865207a65726f20616464726573734f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572a26469706673582212201c832dbf8ddd7f10e1161f8b6491c2b5b11fc411d01f7c164f1cc8726fd2dc4964736f6c634300060a0033";

type AddressBookConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: AddressBookConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class AddressBook__factory extends ContractFactory {
  constructor(...args: AddressBookConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<AddressBook> {
    return super.deploy(overrides || {}) as Promise<AddressBook>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): AddressBook {
    return super.attach(address) as AddressBook;
  }
  connect(signer: Signer): AddressBook__factory {
    return super.connect(signer) as AddressBook__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AddressBookInterface {
    return new utils.Interface(_abi) as AddressBookInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AddressBook {
    return new Contract(address, _abi, signerOrProvider) as AddressBook;
  }
}
