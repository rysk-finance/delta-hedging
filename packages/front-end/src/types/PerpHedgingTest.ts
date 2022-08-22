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

export interface PerpHedgingTestInterface extends utils.Interface {
  functions: {
    "getBalance(address)": FunctionFragment;
    "getDelta()": FunctionFragment;
    "hedgeDelta(int256)": FunctionFragment;
    "perpHedgingReactor()": FunctionFragment;
    "setHedgingReactorAddress(address)": FunctionFragment;
    "sync()": FunctionFragment;
    "syncAndUpdate()": FunctionFragment;
    "update()": FunctionFragment;
    "withdraw(uint256)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "getBalance", values: [string]): string;
  encodeFunctionData(functionFragment: "getDelta", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "hedgeDelta",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "perpHedgingReactor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setHedgingReactorAddress",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "sync", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "syncAndUpdate",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "update", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "getBalance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getDelta", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hedgeDelta", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "perpHedgingReactor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setHedgingReactorAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sync", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "syncAndUpdate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "update", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {};
}

export interface PerpHedgingTest extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PerpHedgingTestInterface;

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
    getBalance(
      collateralAsset: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getDelta(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { delta: BigNumber }>;

    hedgeDelta(
      _delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    perpHedgingReactor(overrides?: CallOverrides): Promise<[string]>;

    setHedgingReactorAddress(
      _address: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    sync(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    syncAndUpdate(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    update(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  getBalance(
    collateralAsset: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getDelta(overrides?: CallOverrides): Promise<BigNumber>;

  hedgeDelta(
    _delta: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  perpHedgingReactor(overrides?: CallOverrides): Promise<string>;

  setHedgingReactorAddress(
    _address: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  sync(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  syncAndUpdate(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  update(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getBalance(
      collateralAsset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDelta(overrides?: CallOverrides): Promise<BigNumber>;

    hedgeDelta(
      _delta: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    perpHedgingReactor(overrides?: CallOverrides): Promise<string>;

    setHedgingReactorAddress(
      _address: string,
      overrides?: CallOverrides
    ): Promise<void>;

    sync(overrides?: CallOverrides): Promise<void>;

    syncAndUpdate(overrides?: CallOverrides): Promise<void>;

    update(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    getBalance(
      collateralAsset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDelta(overrides?: CallOverrides): Promise<BigNumber>;

    hedgeDelta(
      _delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    perpHedgingReactor(overrides?: CallOverrides): Promise<BigNumber>;

    setHedgingReactorAddress(
      _address: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    sync(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    syncAndUpdate(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    update(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdraw(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getBalance(
      collateralAsset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDelta(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    hedgeDelta(
      _delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    perpHedgingReactor(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setHedgingReactorAddress(
      _address: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    sync(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    syncAndUpdate(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    update(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
