/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
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

export type OptionSeriesStruct = {
  expiration: BigNumberish;
  strike: BigNumberish;
  isPut: boolean;
  underlying: string;
  strikeAsset: string;
  collateral: string;
};

export type OptionSeriesStructOutput = [
  BigNumber,
  BigNumber,
  boolean,
  string,
  string,
  string
] & {
  expiration: BigNumber;
  strike: BigNumber;
  isPut: boolean;
  underlying: string;
  strikeAsset: string;
  collateral: string;
};

export interface IOptionRegistryInterface extends utils.Interface {
  functions: {
    "close(address,uint256)": FunctionFragment;
    "gammaController()": FunctionFragment;
    "getCollateral((uint64,uint128,bool,address,address,address),uint256)": FunctionFragment;
    "getOtoken(address,address,uint256,bool,uint256,address)": FunctionFragment;
    "getSeriesInfo(address)": FunctionFragment;
    "issue((uint64,uint128,bool,address,address,address))": FunctionFragment;
    "open(address,uint256,uint256)": FunctionFragment;
    "settle(address)": FunctionFragment;
    "vaultIds(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "close",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "gammaController",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCollateral",
    values: [OptionSeriesStruct, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getOtoken",
    values: [string, string, BigNumberish, boolean, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getSeriesInfo",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "issue",
    values: [OptionSeriesStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "open",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "settle", values: [string]): string;
  encodeFunctionData(functionFragment: "vaultIds", values: [string]): string;

  decodeFunctionResult(functionFragment: "close", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "gammaController",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getOtoken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getSeriesInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "issue", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "open", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "settle", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "vaultIds", data: BytesLike): Result;

  events: {};
}

export interface IOptionRegistry extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IOptionRegistryInterface;

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
    close(
      _series: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    gammaController(overrides?: CallOverrides): Promise<[string]>;

    getCollateral(
      series: OptionSeriesStruct,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getOtoken(
      underlying: string,
      strikeAsset: string,
      expiration: BigNumberish,
      isPut: boolean,
      strike: BigNumberish,
      collateral: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getSeriesInfo(
      series: string,
      overrides?: CallOverrides
    ): Promise<[OptionSeriesStructOutput]>;

    issue(
      optionSeries: OptionSeriesStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    open(
      _series: string,
      amount: BigNumberish,
      collateralAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    settle(
      _series: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    vaultIds(series: string, overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  close(
    _series: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  gammaController(overrides?: CallOverrides): Promise<string>;

  getCollateral(
    series: OptionSeriesStruct,
    amount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getOtoken(
    underlying: string,
    strikeAsset: string,
    expiration: BigNumberish,
    isPut: boolean,
    strike: BigNumberish,
    collateral: string,
    overrides?: CallOverrides
  ): Promise<string>;

  getSeriesInfo(
    series: string,
    overrides?: CallOverrides
  ): Promise<OptionSeriesStructOutput>;

  issue(
    optionSeries: OptionSeriesStruct,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  open(
    _series: string,
    amount: BigNumberish,
    collateralAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  settle(
    _series: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  vaultIds(series: string, overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    close(
      _series: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean, BigNumber]>;

    gammaController(overrides?: CallOverrides): Promise<string>;

    getCollateral(
      series: OptionSeriesStruct,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOtoken(
      underlying: string,
      strikeAsset: string,
      expiration: BigNumberish,
      isPut: boolean,
      strike: BigNumberish,
      collateral: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getSeriesInfo(
      series: string,
      overrides?: CallOverrides
    ): Promise<OptionSeriesStructOutput>;

    issue(
      optionSeries: OptionSeriesStruct,
      overrides?: CallOverrides
    ): Promise<string>;

    open(
      _series: string,
      amount: BigNumberish,
      collateralAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean, BigNumber]>;

    settle(
      _series: string,
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber, BigNumber] & {
        success: boolean;
        collatReturned: BigNumber;
        collatLost: BigNumber;
        amountShort: BigNumber;
      }
    >;

    vaultIds(series: string, overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    close(
      _series: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    gammaController(overrides?: CallOverrides): Promise<BigNumber>;

    getCollateral(
      series: OptionSeriesStruct,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOtoken(
      underlying: string,
      strikeAsset: string,
      expiration: BigNumberish,
      isPut: boolean,
      strike: BigNumberish,
      collateral: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSeriesInfo(
      series: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    issue(
      optionSeries: OptionSeriesStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    open(
      _series: string,
      amount: BigNumberish,
      collateralAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    settle(
      _series: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    vaultIds(series: string, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    close(
      _series: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    gammaController(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getCollateral(
      series: OptionSeriesStruct,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOtoken(
      underlying: string,
      strikeAsset: string,
      expiration: BigNumberish,
      isPut: boolean,
      strike: BigNumberish,
      collateral: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getSeriesInfo(
      series: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    issue(
      optionSeries: OptionSeriesStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    open(
      _series: string,
      amount: BigNumberish,
      collateralAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    settle(
      _series: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    vaultIds(
      series: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
