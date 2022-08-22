/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IExtsload, IExtsloadInterface } from "../IExtsload";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "slot",
        type: "bytes32",
      },
    ],
    name: "extsload",
    outputs: [
      {
        internalType: "bytes32",
        name: "value",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "slots",
        type: "bytes32[]",
      },
    ],
    name: "extsload",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IExtsload__factory {
  static readonly abi = _abi;
  static createInterface(): IExtsloadInterface {
    return new utils.Interface(_abi) as IExtsloadInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IExtsload {
    return new Contract(address, _abi, signerOrProvider) as IExtsload;
  }
}
