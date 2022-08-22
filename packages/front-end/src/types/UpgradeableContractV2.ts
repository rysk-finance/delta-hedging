/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface UpgradeableContractV2Interface extends utils.Interface {
  functions: {
    "addressBook()": FunctionFragment;
    "getV1Version()": FunctionFragment;
    "getV2Version()": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "owner()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addressBook",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getV1Version",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getV2Version",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "addressBook",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getV1Version",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getV2Version",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;

  events: {};
}

export interface UpgradeableContractV2 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: UpgradeableContractV2Interface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addressBook(overrides?: CallOverrides): Promise<[string]>;

    getV1Version(overrides?: CallOverrides): Promise<[BigNumber]>;

    getV2Version(overrides?: CallOverrides): Promise<[BigNumber]>;

    initialize(
      _addressBook: string,
      _owner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;
  };

  addressBook(overrides?: CallOverrides): Promise<string>;

  getV1Version(overrides?: CallOverrides): Promise<BigNumber>;

  getV2Version(overrides?: CallOverrides): Promise<BigNumber>;

  initialize(
    _addressBook: string,
    _owner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    addressBook(overrides?: CallOverrides): Promise<string>;

    getV1Version(overrides?: CallOverrides): Promise<BigNumber>;

    getV2Version(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _addressBook: string,
      _owner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    addressBook(overrides?: CallOverrides): Promise<BigNumber>;

    getV1Version(overrides?: CallOverrides): Promise<BigNumber>;

    getV2Version(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _addressBook: string,
      _owner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    addressBook(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getV1Version(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getV2Version(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initialize(
      _addressBook: string,
      _owner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
