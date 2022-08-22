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

export interface MockAddressBookInterface extends utils.Interface {
  functions: {
    "getController()": FunctionFragment;
    "getMarginCalculator()": FunctionFragment;
    "getMarginPool()": FunctionFragment;
    "getOracle()": FunctionFragment;
    "getOtokenFactory()": FunctionFragment;
    "getOtokenImpl()": FunctionFragment;
    "getWhitelist()": FunctionFragment;
    "setController(address)": FunctionFragment;
    "setMarginCalculator(address)": FunctionFragment;
    "setMarginPool(address)": FunctionFragment;
    "setOracle(address)": FunctionFragment;
    "setOtokenFactory(address)": FunctionFragment;
    "setOtokenImpl(address)": FunctionFragment;
    "setWhitelist(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getController",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMarginCalculator",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMarginPool",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getOracle", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getOtokenFactory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getOtokenImpl",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getWhitelist",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setController",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setMarginCalculator",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setMarginPool",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "setOracle", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setOtokenFactory",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setOtokenImpl",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setWhitelist",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "getController",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMarginCalculator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMarginPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getOracle", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getOtokenFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOtokenImpl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setController",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMarginCalculator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMarginPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setOracle", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setOtokenFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setOtokenImpl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setWhitelist",
    data: BytesLike
  ): Result;

  events: {};
}

export interface MockAddressBook extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MockAddressBookInterface;

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
    getController(overrides?: CallOverrides): Promise<[string]>;

    getMarginCalculator(overrides?: CallOverrides): Promise<[string]>;

    getMarginPool(overrides?: CallOverrides): Promise<[string]>;

    getOracle(overrides?: CallOverrides): Promise<[string]>;

    getOtokenFactory(overrides?: CallOverrides): Promise<[string]>;

    getOtokenImpl(overrides?: CallOverrides): Promise<[string]>;

    getWhitelist(overrides?: CallOverrides): Promise<[string]>;

    setController(
      _controller: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setMarginCalculator(
      _calculator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setMarginPool(
      _pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setOracle(
      _oracleAddr: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setOtokenFactory(
      _otokenFactory: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setOtokenImpl(
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setWhitelist(
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  getController(overrides?: CallOverrides): Promise<string>;

  getMarginCalculator(overrides?: CallOverrides): Promise<string>;

  getMarginPool(overrides?: CallOverrides): Promise<string>;

  getOracle(overrides?: CallOverrides): Promise<string>;

  getOtokenFactory(overrides?: CallOverrides): Promise<string>;

  getOtokenImpl(overrides?: CallOverrides): Promise<string>;

  getWhitelist(overrides?: CallOverrides): Promise<string>;

  setController(
    _controller: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setMarginCalculator(
    _calculator: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setMarginPool(
    _pool: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setOracle(
    _oracleAddr: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setOtokenFactory(
    _otokenFactory: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setOtokenImpl(
    _newImpl: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setWhitelist(
    _newImpl: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getController(overrides?: CallOverrides): Promise<string>;

    getMarginCalculator(overrides?: CallOverrides): Promise<string>;

    getMarginPool(overrides?: CallOverrides): Promise<string>;

    getOracle(overrides?: CallOverrides): Promise<string>;

    getOtokenFactory(overrides?: CallOverrides): Promise<string>;

    getOtokenImpl(overrides?: CallOverrides): Promise<string>;

    getWhitelist(overrides?: CallOverrides): Promise<string>;

    setController(
      _controller: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setMarginCalculator(
      _calculator: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setMarginPool(_pool: string, overrides?: CallOverrides): Promise<void>;

    setOracle(_oracleAddr: string, overrides?: CallOverrides): Promise<void>;

    setOtokenFactory(
      _otokenFactory: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setOtokenImpl(_newImpl: string, overrides?: CallOverrides): Promise<void>;

    setWhitelist(_newImpl: string, overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    getController(overrides?: CallOverrides): Promise<BigNumber>;

    getMarginCalculator(overrides?: CallOverrides): Promise<BigNumber>;

    getMarginPool(overrides?: CallOverrides): Promise<BigNumber>;

    getOracle(overrides?: CallOverrides): Promise<BigNumber>;

    getOtokenFactory(overrides?: CallOverrides): Promise<BigNumber>;

    getOtokenImpl(overrides?: CallOverrides): Promise<BigNumber>;

    getWhitelist(overrides?: CallOverrides): Promise<BigNumber>;

    setController(
      _controller: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setMarginCalculator(
      _calculator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setMarginPool(
      _pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setOracle(
      _oracleAddr: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setOtokenFactory(
      _otokenFactory: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setOtokenImpl(
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setWhitelist(
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getController(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getMarginCalculator(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMarginPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOtokenFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOtokenImpl(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getWhitelist(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setController(
      _controller: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setMarginCalculator(
      _calculator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setMarginPool(
      _pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setOracle(
      _oracleAddr: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setOtokenFactory(
      _otokenFactory: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setOtokenImpl(
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setWhitelist(
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
