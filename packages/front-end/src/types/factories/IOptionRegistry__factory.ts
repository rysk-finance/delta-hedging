/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  IOptionRegistry,
  IOptionRegistryInterface,
} from "../IOptionRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_series",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "close",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
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
    inputs: [],
    name: "gammaController",
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
    inputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "expiration",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "strike",
            type: "uint128",
          },
          {
            internalType: "bool",
            name: "isPut",
            type: "bool",
          },
          {
            internalType: "address",
            name: "underlying",
            type: "address",
          },
          {
            internalType: "address",
            name: "strikeAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "collateral",
            type: "address",
          },
        ],
        internalType: "struct Types.OptionSeries",
        name: "series",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "getCollateral",
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
        name: "underlying",
        type: "address",
      },
      {
        internalType: "address",
        name: "strikeAsset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiration",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isPut",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "strike",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "collateral",
        type: "address",
      },
    ],
    name: "getOtoken",
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
    inputs: [
      {
        internalType: "address",
        name: "series",
        type: "address",
      },
    ],
    name: "getSeriesInfo",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "expiration",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "strike",
            type: "uint128",
          },
          {
            internalType: "bool",
            name: "isPut",
            type: "bool",
          },
          {
            internalType: "address",
            name: "underlying",
            type: "address",
          },
          {
            internalType: "address",
            name: "strikeAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "collateral",
            type: "address",
          },
        ],
        internalType: "struct Types.OptionSeries",
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
        components: [
          {
            internalType: "uint64",
            name: "expiration",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "strike",
            type: "uint128",
          },
          {
            internalType: "bool",
            name: "isPut",
            type: "bool",
          },
          {
            internalType: "address",
            name: "underlying",
            type: "address",
          },
          {
            internalType: "address",
            name: "strikeAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "collateral",
            type: "address",
          },
        ],
        internalType: "struct Types.OptionSeries",
        name: "optionSeries",
        type: "tuple",
      },
    ],
    name: "issue",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_series",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256",
      },
    ],
    name: "open",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
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
        internalType: "address",
        name: "_series",
        type: "address",
      },
    ],
    name: "settle",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "collatReturned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collatLost",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountShort",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "series",
        type: "address",
      },
    ],
    name: "vaultIds",
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
];

export class IOptionRegistry__factory {
  static readonly abi = _abi;
  static createInterface(): IOptionRegistryInterface {
    return new utils.Interface(_abi) as IOptionRegistryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IOptionRegistry {
    return new Contract(address, _abi, signerOrProvider) as IOptionRegistry;
  }
}
