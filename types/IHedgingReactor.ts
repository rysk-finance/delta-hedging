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

export interface IHedgingReactorInterface extends utils.Interface {
  functions: {
    "getDelta()": FunctionFragment;
    "getPoolDenominatedValue()": FunctionFragment;
    "hedgeDelta(int256)": FunctionFragment;
    "update()": FunctionFragment;
    "withdraw(uint256,address)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "getDelta", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getPoolDenominatedValue",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "hedgeDelta",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "update", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish, string]
  ): string;

  decodeFunctionResult(functionFragment: "getDelta", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPoolDenominatedValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "hedgeDelta", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "update", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {};
}

export interface IHedgingReactor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IHedgingReactorInterface;

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
    getDelta(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { delta: BigNumber }>;

    getPoolDenominatedValue(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { value: BigNumber }>;

    hedgeDelta(
      delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    update(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      amount: BigNumberish,
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  getDelta(overrides?: CallOverrides): Promise<BigNumber>;

  getPoolDenominatedValue(overrides?: CallOverrides): Promise<BigNumber>;

  hedgeDelta(
    delta: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  update(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    amount: BigNumberish,
    token: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getDelta(overrides?: CallOverrides): Promise<BigNumber>;

    getPoolDenominatedValue(overrides?: CallOverrides): Promise<BigNumber>;

    hedgeDelta(
      delta: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    update(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      amount: BigNumberish,
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    getDelta(overrides?: CallOverrides): Promise<BigNumber>;

    getPoolDenominatedValue(overrides?: CallOverrides): Promise<BigNumber>;

    hedgeDelta(
      delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    update(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdraw(
      amount: BigNumberish,
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getDelta(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPoolDenominatedValue(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    hedgeDelta(
      delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    update(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      amount: BigNumberish,
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
