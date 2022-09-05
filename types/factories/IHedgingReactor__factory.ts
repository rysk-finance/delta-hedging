/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  IHedgingReactor,
  IHedgingReactorInterface,
} from "../IHedgingReactor";

const _abi = [
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
    inputs: [],
    name: "getPoolDenominatedValue",
    outputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "delta",
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
    inputs: [],
    name: "update",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
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

export class IHedgingReactor__factory {
  static readonly abi = _abi;
  static createInterface(): IHedgingReactorInterface {
    return new utils.Interface(_abi) as IHedgingReactorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IHedgingReactor {
    return new Contract(address, _abi, signerOrProvider) as IHedgingReactor;
  }
}
