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
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace Types {
  export type PortfolioValuesStruct = {
    delta: BigNumberish;
    gamma: BigNumberish;
    vega: BigNumberish;
    theta: BigNumberish;
    callPutsValue: BigNumberish;
    timestamp: BigNumberish;
    spotPrice: BigNumberish;
  };

  export type PortfolioValuesStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    delta: BigNumber;
    gamma: BigNumber;
    vega: BigNumber;
    theta: BigNumber;
    callPutsValue: BigNumber;
    timestamp: BigNumber;
    spotPrice: BigNumber;
  };
}

export interface PortfolioValuesFeedInterface extends utils.Interface {
  contractName: "PortfolioValuesFeed";
  functions: {
    "authority()": FunctionFragment;
    "fee()": FunctionFragment;
    "fulfill(bytes32,address,address,int256,int256,int256,int256,int256,uint256)": FunctionFragment;
    "getPortfolioValues(address,address)": FunctionFragment;
    "jobId()": FunctionFragment;
    "keeper(address)": FunctionFragment;
    "link()": FunctionFragment;
    "liquidityPool()": FunctionFragment;
    "oracle()": FunctionFragment;
    "requestPortfolioData(address,address)": FunctionFragment;
    "setAddressStringMapping(address,string)": FunctionFragment;
    "setAuthority(address)": FunctionFragment;
    "setFee(uint256)": FunctionFragment;
    "setKeeper(address,bool)": FunctionFragment;
    "setLink(address)": FunctionFragment;
    "setLiquidityPool(address)": FunctionFragment;
    "setOracle(address)": FunctionFragment;
    "setjobId(string)": FunctionFragment;
    "stringedAddresses(address)": FunctionFragment;
    "withdrawLink(uint256,address)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "authority", values?: undefined): string;
  encodeFunctionData(functionFragment: "fee", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "fulfill",
    values: [
      BytesLike,
      string,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getPortfolioValues",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "jobId", values?: undefined): string;
  encodeFunctionData(functionFragment: "keeper", values: [string]): string;
  encodeFunctionData(functionFragment: "link", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "liquidityPool",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "oracle", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "requestPortfolioData",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setAddressStringMapping",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setAuthority",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setKeeper",
    values: [string, boolean]
  ): string;
  encodeFunctionData(functionFragment: "setLink", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setLiquidityPool",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "setOracle", values: [string]): string;
  encodeFunctionData(functionFragment: "setjobId", values: [string]): string;
  encodeFunctionData(
    functionFragment: "stringedAddresses",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawLink",
    values: [BigNumberish, string]
  ): string;

  decodeFunctionResult(functionFragment: "authority", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "fee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "fulfill", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPortfolioValues",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "jobId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "keeper", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "link", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "liquidityPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "oracle", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "requestPortfolioData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAddressStringMapping",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAuthority",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setKeeper", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setLink", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setLiquidityPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setOracle", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setjobId", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stringedAddresses",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawLink",
    data: BytesLike
  ): Result;

  events: {
    "AuthorityUpdated(address)": EventFragment;
    "ChainlinkCancelled(bytes32)": EventFragment;
    "ChainlinkFulfilled(bytes32)": EventFragment;
    "ChainlinkRequested(bytes32)": EventFragment;
    "DataFullfilled(address,address,int256,int256,int256,int256,int256)": EventFragment;
    "SetAddressStringMapping(address,string)": EventFragment;
    "SetFee(uint256)": EventFragment;
    "SetJobId(bytes32)": EventFragment;
    "SetLiquidityPool(address)": EventFragment;
    "SetOracle(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AuthorityUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ChainlinkCancelled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ChainlinkFulfilled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ChainlinkRequested"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DataFullfilled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetAddressStringMapping"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetFee"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetJobId"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetLiquidityPool"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetOracle"): EventFragment;
}

export type AuthorityUpdatedEvent = TypedEvent<[string], { authority: string }>;

export type AuthorityUpdatedEventFilter =
  TypedEventFilter<AuthorityUpdatedEvent>;

export type ChainlinkCancelledEvent = TypedEvent<[string], { id: string }>;

export type ChainlinkCancelledEventFilter =
  TypedEventFilter<ChainlinkCancelledEvent>;

export type ChainlinkFulfilledEvent = TypedEvent<[string], { id: string }>;

export type ChainlinkFulfilledEventFilter =
  TypedEventFilter<ChainlinkFulfilledEvent>;

export type ChainlinkRequestedEvent = TypedEvent<[string], { id: string }>;

export type ChainlinkRequestedEventFilter =
  TypedEventFilter<ChainlinkRequestedEvent>;

export type DataFullfilledEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber],
  {
    underlying: string;
    strike: string;
    delta: BigNumber;
    gamma: BigNumber;
    vega: BigNumber;
    theta: BigNumber;
    callPutsValue: BigNumber;
  }
>;

export type DataFullfilledEventFilter = TypedEventFilter<DataFullfilledEvent>;

export type SetAddressStringMappingEvent = TypedEvent<
  [string, string],
  { asset: string; stringVersion: string }
>;

export type SetAddressStringMappingEventFilter =
  TypedEventFilter<SetAddressStringMappingEvent>;

export type SetFeeEvent = TypedEvent<[BigNumber], { fee: BigNumber }>;

export type SetFeeEventFilter = TypedEventFilter<SetFeeEvent>;

export type SetJobIdEvent = TypedEvent<[string], { jobId: string }>;

export type SetJobIdEventFilter = TypedEventFilter<SetJobIdEvent>;

export type SetLiquidityPoolEvent = TypedEvent<
  [string],
  { liquidityPool: string }
>;

export type SetLiquidityPoolEventFilter =
  TypedEventFilter<SetLiquidityPoolEvent>;

export type SetOracleEvent = TypedEvent<[string], { oracle: string }>;

export type SetOracleEventFilter = TypedEventFilter<SetOracleEvent>;

export interface PortfolioValuesFeed extends BaseContract {
  contractName: "PortfolioValuesFeed";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PortfolioValuesFeedInterface;

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
    authority(overrides?: CallOverrides): Promise<[string]>;

    fee(overrides?: CallOverrides): Promise<[BigNumber]>;

    fulfill(
      _requestId: BytesLike,
      _underlying: string,
      _strike: string,
      _delta: BigNumberish,
      _gamma: BigNumberish,
      _vega: BigNumberish,
      _theta: BigNumberish,
      _callPutsValue: BigNumberish,
      _spotPrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getPortfolioValues(
      underlying: string,
      strike: string,
      overrides?: CallOverrides
    ): Promise<[Types.PortfolioValuesStructOutput]>;

    jobId(overrides?: CallOverrides): Promise<[string]>;

    keeper(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;

    link(overrides?: CallOverrides): Promise<[string]>;

    liquidityPool(overrides?: CallOverrides): Promise<[string]>;

    oracle(overrides?: CallOverrides): Promise<[string]>;

    requestPortfolioData(
      _underlying: string,
      _strike: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setAddressStringMapping(
      _asset: string,
      _stringVersion: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setFee(
      _fee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setKeeper(
      _keeper: string,
      _auth: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setLink(
      _link: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setLiquidityPool(
      _liquidityPool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setOracle(
      _oracle: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setjobId(
      _jobId: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    stringedAddresses(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    withdrawLink(
      _amount: BigNumberish,
      _target: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  authority(overrides?: CallOverrides): Promise<string>;

  fee(overrides?: CallOverrides): Promise<BigNumber>;

  fulfill(
    _requestId: BytesLike,
    _underlying: string,
    _strike: string,
    _delta: BigNumberish,
    _gamma: BigNumberish,
    _vega: BigNumberish,
    _theta: BigNumberish,
    _callPutsValue: BigNumberish,
    _spotPrice: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getPortfolioValues(
    underlying: string,
    strike: string,
    overrides?: CallOverrides
  ): Promise<Types.PortfolioValuesStructOutput>;

  jobId(overrides?: CallOverrides): Promise<string>;

  keeper(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  link(overrides?: CallOverrides): Promise<string>;

  liquidityPool(overrides?: CallOverrides): Promise<string>;

  oracle(overrides?: CallOverrides): Promise<string>;

  requestPortfolioData(
    _underlying: string,
    _strike: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setAddressStringMapping(
    _asset: string,
    _stringVersion: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setAuthority(
    _newAuthority: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setFee(
    _fee: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setKeeper(
    _keeper: string,
    _auth: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setLink(
    _link: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setLiquidityPool(
    _liquidityPool: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setOracle(
    _oracle: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setjobId(
    _jobId: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  stringedAddresses(arg0: string, overrides?: CallOverrides): Promise<string>;

  withdrawLink(
    _amount: BigNumberish,
    _target: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    authority(overrides?: CallOverrides): Promise<string>;

    fee(overrides?: CallOverrides): Promise<BigNumber>;

    fulfill(
      _requestId: BytesLike,
      _underlying: string,
      _strike: string,
      _delta: BigNumberish,
      _gamma: BigNumberish,
      _vega: BigNumberish,
      _theta: BigNumberish,
      _callPutsValue: BigNumberish,
      _spotPrice: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getPortfolioValues(
      underlying: string,
      strike: string,
      overrides?: CallOverrides
    ): Promise<Types.PortfolioValuesStructOutput>;

    jobId(overrides?: CallOverrides): Promise<string>;

    keeper(arg0: string, overrides?: CallOverrides): Promise<boolean>;

    link(overrides?: CallOverrides): Promise<string>;

    liquidityPool(overrides?: CallOverrides): Promise<string>;

    oracle(overrides?: CallOverrides): Promise<string>;

    requestPortfolioData(
      _underlying: string,
      _strike: string,
      overrides?: CallOverrides
    ): Promise<string>;

    setAddressStringMapping(
      _asset: string,
      _stringVersion: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setAuthority(
      _newAuthority: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setFee(_fee: BigNumberish, overrides?: CallOverrides): Promise<void>;

    setKeeper(
      _keeper: string,
      _auth: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    setLink(_link: string, overrides?: CallOverrides): Promise<void>;

    setLiquidityPool(
      _liquidityPool: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setOracle(_oracle: string, overrides?: CallOverrides): Promise<void>;

    setjobId(_jobId: string, overrides?: CallOverrides): Promise<void>;

    stringedAddresses(arg0: string, overrides?: CallOverrides): Promise<string>;

    withdrawLink(
      _amount: BigNumberish,
      _target: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "AuthorityUpdated(address)"(authority?: null): AuthorityUpdatedEventFilter;
    AuthorityUpdated(authority?: null): AuthorityUpdatedEventFilter;

    "ChainlinkCancelled(bytes32)"(
      id?: BytesLike | null
    ): ChainlinkCancelledEventFilter;
    ChainlinkCancelled(id?: BytesLike | null): ChainlinkCancelledEventFilter;

    "ChainlinkFulfilled(bytes32)"(
      id?: BytesLike | null
    ): ChainlinkFulfilledEventFilter;
    ChainlinkFulfilled(id?: BytesLike | null): ChainlinkFulfilledEventFilter;

    "ChainlinkRequested(bytes32)"(
      id?: BytesLike | null
    ): ChainlinkRequestedEventFilter;
    ChainlinkRequested(id?: BytesLike | null): ChainlinkRequestedEventFilter;

    "DataFullfilled(address,address,int256,int256,int256,int256,int256)"(
      underlying?: string | null,
      strike?: string | null,
      delta?: null,
      gamma?: null,
      vega?: null,
      theta?: null,
      callPutsValue?: null
    ): DataFullfilledEventFilter;
    DataFullfilled(
      underlying?: string | null,
      strike?: string | null,
      delta?: null,
      gamma?: null,
      vega?: null,
      theta?: null,
      callPutsValue?: null
    ): DataFullfilledEventFilter;

    "SetAddressStringMapping(address,string)"(
      asset?: null,
      stringVersion?: null
    ): SetAddressStringMappingEventFilter;
    SetAddressStringMapping(
      asset?: null,
      stringVersion?: null
    ): SetAddressStringMappingEventFilter;

    "SetFee(uint256)"(fee?: null): SetFeeEventFilter;
    SetFee(fee?: null): SetFeeEventFilter;

    "SetJobId(bytes32)"(jobId?: null): SetJobIdEventFilter;
    SetJobId(jobId?: null): SetJobIdEventFilter;

    "SetLiquidityPool(address)"(
      liquidityPool?: null
    ): SetLiquidityPoolEventFilter;
    SetLiquidityPool(liquidityPool?: null): SetLiquidityPoolEventFilter;

    "SetOracle(address)"(oracle?: null): SetOracleEventFilter;
    SetOracle(oracle?: null): SetOracleEventFilter;
  };

  estimateGas: {
    authority(overrides?: CallOverrides): Promise<BigNumber>;

    fee(overrides?: CallOverrides): Promise<BigNumber>;

    fulfill(
      _requestId: BytesLike,
      _underlying: string,
      _strike: string,
      _delta: BigNumberish,
      _gamma: BigNumberish,
      _vega: BigNumberish,
      _theta: BigNumberish,
      _callPutsValue: BigNumberish,
      _spotPrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getPortfolioValues(
      underlying: string,
      strike: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    jobId(overrides?: CallOverrides): Promise<BigNumber>;

    keeper(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    link(overrides?: CallOverrides): Promise<BigNumber>;

    liquidityPool(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<BigNumber>;

    requestPortfolioData(
      _underlying: string,
      _strike: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setAddressStringMapping(
      _asset: string,
      _stringVersion: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setFee(
      _fee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setKeeper(
      _keeper: string,
      _auth: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setLink(
      _link: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setLiquidityPool(
      _liquidityPool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setOracle(
      _oracle: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setjobId(
      _jobId: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    stringedAddresses(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdrawLink(
      _amount: BigNumberish,
      _target: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    authority(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    fee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    fulfill(
      _requestId: BytesLike,
      _underlying: string,
      _strike: string,
      _delta: BigNumberish,
      _gamma: BigNumberish,
      _vega: BigNumberish,
      _theta: BigNumberish,
      _callPutsValue: BigNumberish,
      _spotPrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getPortfolioValues(
      underlying: string,
      strike: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    jobId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    keeper(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    link(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    liquidityPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    oracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    requestPortfolioData(
      _underlying: string,
      _strike: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setAddressStringMapping(
      _asset: string,
      _stringVersion: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setFee(
      _fee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setKeeper(
      _keeper: string,
      _auth: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setLink(
      _link: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setLiquidityPool(
      _liquidityPool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setOracle(
      _oracle: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setjobId(
      _jobId: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    stringedAddresses(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdrawLink(
      _amount: BigNumberish,
      _target: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
