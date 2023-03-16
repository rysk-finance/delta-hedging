/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace DHVLensMK1 {
  export type TradingSpecStruct = {
    iv: BigNumberish;
    quote: BigNumberish;
    fee: BigNumberish;
    disabled: boolean;
  };

  export type TradingSpecStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    boolean
  ] & { iv: BigNumber; quote: BigNumber; fee: BigNumber; disabled: boolean };

  export type OptionStrikeDrillStruct = {
    strike: BigNumberish;
    bid: DHVLensMK1.TradingSpecStruct;
    ask: DHVLensMK1.TradingSpecStruct;
    delta: BigNumberish;
    exposure: BigNumberish;
  };

  export type OptionStrikeDrillStructOutput = [
    BigNumber,
    DHVLensMK1.TradingSpecStructOutput,
    DHVLensMK1.TradingSpecStructOutput,
    BigNumber,
    BigNumber
  ] & {
    strike: BigNumber;
    bid: DHVLensMK1.TradingSpecStructOutput;
    ask: DHVLensMK1.TradingSpecStructOutput;
    delta: BigNumber;
    exposure: BigNumber;
  };

  export type OptionExpirationDrillStruct = {
    expiration: BigNumberish;
    callStrikes: BigNumberish[];
    callOptionDrill: DHVLensMK1.OptionStrikeDrillStruct[];
    putStrikes: BigNumberish[];
    putOptionDrill: DHVLensMK1.OptionStrikeDrillStruct[];
  };

  export type OptionExpirationDrillStructOutput = [
    BigNumber,
    BigNumber[],
    DHVLensMK1.OptionStrikeDrillStructOutput[],
    BigNumber[],
    DHVLensMK1.OptionStrikeDrillStructOutput[]
  ] & {
    expiration: BigNumber;
    callStrikes: BigNumber[];
    callOptionDrill: DHVLensMK1.OptionStrikeDrillStructOutput[];
    putStrikes: BigNumber[];
    putOptionDrill: DHVLensMK1.OptionStrikeDrillStructOutput[];
  };

  export type OptionChainStruct = {
    expirations: BigNumberish[];
    optionExpirationDrills: DHVLensMK1.OptionExpirationDrillStruct[];
  };

  export type OptionChainStructOutput = [
    BigNumber[],
    DHVLensMK1.OptionExpirationDrillStructOutput[]
  ] & {
    expirations: BigNumber[];
    optionExpirationDrills: DHVLensMK1.OptionExpirationDrillStructOutput[];
  };
}

export interface DHVLensMK1Interface extends utils.Interface {
  contractName: "DHVLensMK1";
  functions: {
    "catalogue()": FunctionFragment;
    "collateralAsset()": FunctionFragment;
    "getExpirations()": FunctionFragment;
    "getOptionChain()": FunctionFragment;
    "getOptionExpirationDrill(uint64)": FunctionFragment;
    "pricer()": FunctionFragment;
    "protocol()": FunctionFragment;
    "strikeAsset()": FunctionFragment;
    "underlyingAsset()": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "catalogue", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "collateralAsset",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getExpirations",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getOptionChain",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getOptionExpirationDrill",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "pricer", values?: undefined): string;
  encodeFunctionData(functionFragment: "protocol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "strikeAsset",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlyingAsset",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "catalogue", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "collateralAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExpirations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOptionChain",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOptionExpirationDrill",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "pricer", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "protocol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "strikeAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "underlyingAsset",
    data: BytesLike
  ): Result;

  events: {};
}

export interface DHVLensMK1 extends BaseContract {
  contractName: "DHVLensMK1";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DHVLensMK1Interface;

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
    catalogue(overrides?: CallOverrides): Promise<[string]>;

    collateralAsset(overrides?: CallOverrides): Promise<[string]>;

    getExpirations(overrides?: CallOverrides): Promise<[BigNumber[]]>;

    getOptionChain(
      overrides?: CallOverrides
    ): Promise<[DHVLensMK1.OptionChainStructOutput]>;

    getOptionExpirationDrill(
      expiration: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[DHVLensMK1.OptionExpirationDrillStructOutput]>;

    pricer(overrides?: CallOverrides): Promise<[string]>;

    protocol(overrides?: CallOverrides): Promise<[string]>;

    strikeAsset(overrides?: CallOverrides): Promise<[string]>;

    underlyingAsset(overrides?: CallOverrides): Promise<[string]>;
  };

  catalogue(overrides?: CallOverrides): Promise<string>;

  collateralAsset(overrides?: CallOverrides): Promise<string>;

  getExpirations(overrides?: CallOverrides): Promise<BigNumber[]>;

  getOptionChain(
    overrides?: CallOverrides
  ): Promise<DHVLensMK1.OptionChainStructOutput>;

  getOptionExpirationDrill(
    expiration: BigNumberish,
    overrides?: CallOverrides
  ): Promise<DHVLensMK1.OptionExpirationDrillStructOutput>;

  pricer(overrides?: CallOverrides): Promise<string>;

  protocol(overrides?: CallOverrides): Promise<string>;

  strikeAsset(overrides?: CallOverrides): Promise<string>;

  underlyingAsset(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    catalogue(overrides?: CallOverrides): Promise<string>;

    collateralAsset(overrides?: CallOverrides): Promise<string>;

    getExpirations(overrides?: CallOverrides): Promise<BigNumber[]>;

    getOptionChain(
      overrides?: CallOverrides
    ): Promise<DHVLensMK1.OptionChainStructOutput>;

    getOptionExpirationDrill(
      expiration: BigNumberish,
      overrides?: CallOverrides
    ): Promise<DHVLensMK1.OptionExpirationDrillStructOutput>;

    pricer(overrides?: CallOverrides): Promise<string>;

    protocol(overrides?: CallOverrides): Promise<string>;

    strikeAsset(overrides?: CallOverrides): Promise<string>;

    underlyingAsset(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    catalogue(overrides?: CallOverrides): Promise<BigNumber>;

    collateralAsset(overrides?: CallOverrides): Promise<BigNumber>;

    getExpirations(overrides?: CallOverrides): Promise<BigNumber>;

    getOptionChain(overrides?: CallOverrides): Promise<BigNumber>;

    getOptionExpirationDrill(
      expiration: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    pricer(overrides?: CallOverrides): Promise<BigNumber>;

    protocol(overrides?: CallOverrides): Promise<BigNumber>;

    strikeAsset(overrides?: CallOverrides): Promise<BigNumber>;

    underlyingAsset(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    catalogue(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    collateralAsset(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getExpirations(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOptionChain(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOptionExpirationDrill(
      expiration: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    pricer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    protocol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    strikeAsset(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    underlyingAsset(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
