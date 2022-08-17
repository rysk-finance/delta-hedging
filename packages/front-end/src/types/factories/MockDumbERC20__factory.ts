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
import type { MockDumbERC20, MockDumbERC20Interface } from "../MockDumbERC20";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
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
        internalType: "address",
        name: "recipient",
        type: "address",
      },
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
        name: "recipient",
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
    inputs: [
      {
        internalType: "bool",
        name: "locked_",
        type: "bool",
      },
    ],
    name: "setLocked",
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
        name: "recipient",
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
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
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
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610aec380380610aec8339818101604052606081101561003357600080fd5b810190808051604051939291908464010000000082111561005357600080fd5b90830190602082018581111561006857600080fd5b825164010000000081118282018810171561008257600080fd5b82525081516020918201929091019080838360005b838110156100af578181015183820152602001610097565b50505050905090810190601f1680156100dc5780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156100ff57600080fd5b90830190602082018581111561011457600080fd5b825164010000000081118282018810171561012e57600080fd5b82525081516020918201929091019080838360005b8381101561015b578181015183820152602001610143565b50505050905090810190601f1680156101885780820380516001836020036101000a031916815260200191505b5060405260209081015185519093506101a792506004918601906101d8565b5081516101bb9060059060208501906101d8565b506006805460ff191660ff92909216919091179055506102739050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061021957805160ff1916838001178555610246565b82800160010185558215610246579182015b8281111561024657825182559160200191906001019061022b565b50610252929150610256565b5090565b61027091905b80821115610252576000815560010161025c565b90565b61086a806102826000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806340c10f191161007157806340c10f191461020557806370a082311461023157806395d89b41146102575780639dc29fac1461025f578063a9059cbb1461028b578063dd62ed3e146102b7576100b4565b806306fdde03146100b9578063095ea7b31461013657806318160ddd14610176578063211e28b61461019057806323b872dd146101b1578063313ce567146101e7575b600080fd5b6100c16102e5565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100fb5781810151838201526020016100e3565b50505050905090810190601f1680156101285780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101626004803603604081101561014c57600080fd5b506001600160a01b03813516906020013561037b565b604080519115158252519081900360200190f35b61017e6103dd565b60408051918252519081900360200190f35b6101af600480360360208110156101a657600080fd5b503515156103e3565b005b610162600480360360608110156101c757600080fd5b506001600160a01b038135811691602081013590911690604001356103f6565b6101ef610538565b6040805160ff9092168252519081900360200190f35b6101af6004803603604081101561021b57600080fd5b506001600160a01b038135169060200135610541565b61017e6004803603602081101561024757600080fd5b50356001600160a01b031661058a565b6100c16105a5565b6101af6004803603604081101561027557600080fd5b506001600160a01b038135169060200135610606565b610162600480360360408110156102a157600080fd5b506001600160a01b03813516906020013561062f565b61017e600480360360408110156102cd57600080fd5b506001600160a01b03813581169160200135166106db565b60048054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156103715780601f1061034657610100808354040283529160200191610371565b820191906000526020600020905b81548152906001019060200180831161035457829003601f168201915b5050505050905090565b3360009081526002602090815260408083206001600160a01b03861684529091528120546103af908363ffffffff61070616565b3360009081526002602090815260408083206001600160a01b03881684529091529020555060015b92915050565b60035490565b6000805460ff1916911515919091179055565b6000805460ff161561040a57506000610531565b6001600160a01b03841660009081526001602052604090205482111561043257506000610531565b6001600160a01b038416600090815260026020908152604080832033845290915290205482111561046557506000610531565b6001600160a01b0384166000908152600260209081526040808320338452909152902054610499908363ffffffff61076016565b6001600160a01b0385166000818152600260209081526040808320338452825280832094909455918152600190915220546104da908363ffffffff61076016565b6001600160a01b03808616600090815260016020526040808220939093559085168152205461050f908363ffffffff61070616565b6001600160a01b03841660009081526001602081905260409091209190915590505b9392505050565b60065460ff1690565b6001600160a01b03821660009081526001602052604090205461056a908263ffffffff61070616565b6001600160a01b0390921660009081526001602052604090209190915550565b6001600160a01b031660009081526001602052604090205490565b60058054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156103715780601f1061034657610100808354040283529160200191610371565b6001600160a01b03821660009081526001602052604090205461056a908263ffffffff61076016565b6000805460ff1615610643575060006103d7565b33600090815260016020526040902054821115610662575060006103d7565b33600090815260016020526040902054610682908363ffffffff61076016565b33600090815260016020526040808220929092556001600160a01b038516815220546106b4908363ffffffff61070616565b6001600160a01b038416600090815260016020819052604090912091909155905092915050565b6001600160a01b03918216600090815260026020908152604080832093909416825291909152205490565b600082820183811015610531576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b600061053183836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f7700008152506000818484111561082c5760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b838110156107f15781810151838201526020016107d9565b50505050905090810190601f16801561081e5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b50505090039056fea2646970667358221220a462f09ad0a555181147a89e50229236ed1983ca7d1be5f46991404905df26b364736f6c634300060a0033";

type MockDumbERC20ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockDumbERC20ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockDumbERC20__factory extends ContractFactory {
  constructor(...args: MockDumbERC20ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    name_: string,
    symbol_: string,
    decimals_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MockDumbERC20> {
    return super.deploy(
      name_,
      symbol_,
      decimals_,
      overrides || {}
    ) as Promise<MockDumbERC20>;
  }
  getDeployTransaction(
    name_: string,
    symbol_: string,
    decimals_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      name_,
      symbol_,
      decimals_,
      overrides || {}
    );
  }
  attach(address: string): MockDumbERC20 {
    return super.attach(address) as MockDumbERC20;
  }
  connect(signer: Signer): MockDumbERC20__factory {
    return super.connect(signer) as MockDumbERC20__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockDumbERC20Interface {
    return new utils.Interface(_abi) as MockDumbERC20Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockDumbERC20 {
    return new Contract(address, _abi, signerOrProvider) as MockDumbERC20;
  }
}
