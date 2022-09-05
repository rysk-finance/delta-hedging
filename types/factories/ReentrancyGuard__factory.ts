/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ReentrancyGuard,
  ReentrancyGuardInterface,
} from "../ReentrancyGuard";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b506001600055603f8060226000396000f3fe6080604052600080fdfea264697066735822122004cd47bc0eedae428c648dc4be65561b33d906077e0c8c22cc2e375d5851553064736f6c63430008090033";

type ReentrancyGuardConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ReentrancyGuardConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ReentrancyGuard__factory extends ContractFactory {
  constructor(...args: ReentrancyGuardConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ReentrancyGuard> {
    return super.deploy(overrides || {}) as Promise<ReentrancyGuard>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ReentrancyGuard {
    return super.attach(address) as ReentrancyGuard;
  }
  connect(signer: Signer): ReentrancyGuard__factory {
    return super.connect(signer) as ReentrancyGuard__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ReentrancyGuardInterface {
    return new utils.Interface(_abi) as ReentrancyGuardInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ReentrancyGuard {
    return new Contract(address, _abi, signerOrProvider) as ReentrancyGuard;
  }
}
