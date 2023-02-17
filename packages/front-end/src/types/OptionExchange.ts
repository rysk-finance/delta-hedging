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
}

export declare namespace CombinedActions {
  export type ActionArgsStruct = {
    actionType: BigNumberish;
    owner: string;
    secondAddress: string;
    asset: string;
    vaultId: BigNumberish;
    amount: BigNumberish;
    optionSeries: Types.OptionSeriesStruct;
    index: BigNumberish;
    data: BytesLike;
  };

  export type ActionArgsStructOutput = [
    BigNumber,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    Types.OptionSeriesStructOutput,
    BigNumber,
    string
  ] & {
    actionType: BigNumber;
    owner: string;
    secondAddress: string;
    asset: string;
    vaultId: BigNumber;
    amount: BigNumber;
    optionSeries: Types.OptionSeriesStructOutput;
    index: BigNumber;
    data: string;
  };

  export type OperationProceduresStruct = {
    operation: BigNumberish;
    operationQueue: CombinedActions.ActionArgsStruct[];
  };

  export type OperationProceduresStructOutput = [
    number,
    CombinedActions.ActionArgsStructOutput[]
  ] & {
    operation: number;
    operationQueue: CombinedActions.ActionArgsStructOutput[];
  };
}

export interface OptionExchangeInterface extends utils.Interface {
  contractName: "OptionExchange";
  functions: {
    "addressbook()": FunctionFragment;
    "approvedCollateral(address,bool)": FunctionFragment;
    "authority()": FunctionFragment;
    "catalogue()": FunctionFragment;
    "changeApprovedCollateral(address,bool,bool)": FunctionFragment;
    "checkHash((uint64,uint128,bool,address,address,address),uint128,bool)": FunctionFragment;
    "collateralAsset()": FunctionFragment;
    "createOtoken((uint64,uint128,bool,address,address,address))": FunctionFragment;
    "feeRecipient()": FunctionFragment;
    "formatStrikePrice(uint256,address)": FunctionFragment;
    "getDelta()": FunctionFragment;
    "getOptionDetails(address,(uint64,uint128,bool,address,address,address))": FunctionFragment;
    "getPoolDenominatedValue()": FunctionFragment;
    "getPortfolioValuesFeed()": FunctionFragment;
    "hedgeDelta(int256)": FunctionFragment;
    "heldTokens(address,address)": FunctionFragment;
    "liquidityPool()": FunctionFragment;
    "maxTradeSize()": FunctionFragment;
    "migrateOtokens(address,address[])": FunctionFragment;
    "minTradeSize()": FunctionFragment;
    "operate((uint8,(uint256,address,address,address,uint256,uint256,(uint64,uint128,bool,address,address,address),uint256,bytes)[])[])": FunctionFragment;
    "pause()": FunctionFragment;
    "paused()": FunctionFragment;
    "poolFees(address)": FunctionFragment;
    "pricer()": FunctionFragment;
    "protocol()": FunctionFragment;
    "redeem(address[],uint256[])": FunctionFragment;
    "setAuthority(address)": FunctionFragment;
    "setFeeRecipient(address)": FunctionFragment;
    "setOptionCatalogue(address)": FunctionFragment;
    "setPoolFee(address,uint24)": FunctionFragment;
    "setPricer(address)": FunctionFragment;
    "setTradeSizeLimits(uint256,uint256)": FunctionFragment;
    "strikeAsset()": FunctionFragment;
    "swapRouter()": FunctionFragment;
    "underlyingAsset()": FunctionFragment;
    "unpause()": FunctionFragment;
    "update()": FunctionFragment;
    "withdraw(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addressbook",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "approvedCollateral",
    values: [string, boolean]
  ): string;
  encodeFunctionData(functionFragment: "authority", values?: undefined): string;
  encodeFunctionData(functionFragment: "catalogue", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "changeApprovedCollateral",
    values: [string, boolean, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "checkHash",
    values: [Types.OptionSeriesStruct, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "collateralAsset",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "createOtoken",
    values: [Types.OptionSeriesStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "feeRecipient",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "formatStrikePrice",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(functionFragment: "getDelta", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getOptionDetails",
    values: [string, Types.OptionSeriesStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getPoolDenominatedValue",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPortfolioValuesFeed",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "hedgeDelta",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "heldTokens",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "liquidityPool",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "maxTradeSize",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "migrateOtokens",
    values: [string, string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "minTradeSize",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "operate",
    values: [CombinedActions.OperationProceduresStruct[]]
  ): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(functionFragment: "poolFees", values: [string]): string;
  encodeFunctionData(functionFragment: "pricer", values?: undefined): string;
  encodeFunctionData(functionFragment: "protocol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "redeem",
    values: [string[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "setAuthority",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setFeeRecipient",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setOptionCatalogue",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setPoolFee",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "setPricer", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setTradeSizeLimits",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "strikeAsset",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "swapRouter",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlyingAsset",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(functionFragment: "update", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "addressbook",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "approvedCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "authority", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "catalogue", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "changeApprovedCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "checkHash", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "collateralAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createOtoken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "feeRecipient",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "formatStrikePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getDelta", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getOptionDetails",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPoolDenominatedValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPortfolioValuesFeed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "hedgeDelta", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "heldTokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "liquidityPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxTradeSize",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "migrateOtokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "minTradeSize",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "operate", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "poolFees", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pricer", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "protocol", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setAuthority",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFeeRecipient",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setOptionCatalogue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setPoolFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setPricer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setTradeSizeLimits",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "strikeAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swapRouter", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "underlyingAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "update", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "AuthorityUpdated(address)": EventFragment;
    "CollateralApprovalChanged(address,bool,bool)": EventFragment;
    "OptionsBought(address,address,uint256)": EventFragment;
    "OptionsIssued(address)": EventFragment;
    "OptionsRedeemed(address,uint256,uint256,address)": EventFragment;
    "OptionsSold(address,address,uint256)": EventFragment;
    "OtokenMigrated(address,address,uint256)": EventFragment;
    "Paused(address)": EventFragment;
    "RedemptionSent(uint256,address,address)": EventFragment;
    "Unpaused(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AuthorityUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CollateralApprovalChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OptionsBought"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OptionsIssued"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OptionsRedeemed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OptionsSold"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OtokenMigrated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RedemptionSent"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
}

export type AuthorityUpdatedEvent = TypedEvent<[string], { authority: string }>;

export type AuthorityUpdatedEventFilter =
  TypedEventFilter<AuthorityUpdatedEvent>;

export type CollateralApprovalChangedEvent = TypedEvent<
  [string, boolean, boolean],
  { collateral: string; isPut: boolean; isApproved: boolean }
>;

export type CollateralApprovalChangedEventFilter =
  TypedEventFilter<CollateralApprovalChangedEvent>;

export type OptionsBoughtEvent = TypedEvent<
  [string, string, BigNumber],
  { series: string; buyer: string; optionAmount: BigNumber }
>;

export type OptionsBoughtEventFilter = TypedEventFilter<OptionsBoughtEvent>;

export type OptionsIssuedEvent = TypedEvent<[string], { series: string }>;

export type OptionsIssuedEventFilter = TypedEventFilter<OptionsIssuedEvent>;

export type OptionsRedeemedEvent = TypedEvent<
  [string, BigNumber, BigNumber, string],
  {
    series: string;
    optionAmount: BigNumber;
    redeemAmount: BigNumber;
    redeemAsset: string;
  }
>;

export type OptionsRedeemedEventFilter = TypedEventFilter<OptionsRedeemedEvent>;

export type OptionsSoldEvent = TypedEvent<
  [string, string, BigNumber],
  { series: string; seller: string; optionAmount: BigNumber }
>;

export type OptionsSoldEventFilter = TypedEventFilter<OptionsSoldEvent>;

export type OtokenMigratedEvent = TypedEvent<
  [string, string, BigNumber],
  { newOptionExchange: string; otoken: string; amount: BigNumber }
>;

export type OtokenMigratedEventFilter = TypedEventFilter<OtokenMigratedEvent>;

export type PausedEvent = TypedEvent<[string], { account: string }>;

export type PausedEventFilter = TypedEventFilter<PausedEvent>;

export type RedemptionSentEvent = TypedEvent<
  [BigNumber, string, string],
  { redeemAmount: BigNumber; redeemAsset: string; recipient: string }
>;

export type RedemptionSentEventFilter = TypedEventFilter<RedemptionSentEvent>;

export type UnpausedEvent = TypedEvent<[string], { account: string }>;

export type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;

export interface OptionExchange extends BaseContract {
  contractName: "OptionExchange";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: OptionExchangeInterface;

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
    addressbook(overrides?: CallOverrides): Promise<[string]>;

    approvedCollateral(
      arg0: string,
      arg1: boolean,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    authority(overrides?: CallOverrides): Promise<[string]>;

    catalogue(overrides?: CallOverrides): Promise<[string]>;

    changeApprovedCollateral(
      collateral: string,
      isPut: boolean,
      isApproved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    checkHash(
      optionSeries: Types.OptionSeriesStruct,
      strikeDecimalConverted: BigNumberish,
      isSell: boolean,
      overrides?: CallOverrides
    ): Promise<[string] & { oHash: string }>;

    collateralAsset(overrides?: CallOverrides): Promise<[string]>;

    createOtoken(
      optionSeries: Types.OptionSeriesStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    feeRecipient(overrides?: CallOverrides): Promise<[string]>;

    formatStrikePrice(
      strikePrice: BigNumberish,
      collateral: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getDelta(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { delta: BigNumber }>;

    getOptionDetails(
      seriesAddress: string,
      optionSeries: Types.OptionSeriesStruct,
      overrides?: CallOverrides
    ): Promise<[string, Types.OptionSeriesStructOutput, BigNumber]>;

    getPoolDenominatedValue(overrides?: CallOverrides): Promise<[BigNumber]>;

    getPortfolioValuesFeed(overrides?: CallOverrides): Promise<[string]>;

    hedgeDelta(
      _delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    heldTokens(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    liquidityPool(overrides?: CallOverrides): Promise<[string]>;

    maxTradeSize(overrides?: CallOverrides): Promise<[BigNumber]>;

    migrateOtokens(
      newOptionExchange: string,
      otokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    minTradeSize(overrides?: CallOverrides): Promise<[BigNumber]>;

    operate(
      _operationProcedures: CombinedActions.OperationProceduresStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

    poolFees(arg0: string, overrides?: CallOverrides): Promise<[number]>;

    pricer(overrides?: CallOverrides): Promise<[string]>;

    protocol(overrides?: CallOverrides): Promise<[string]>;

    redeem(
      _series: string[],
      amountOutMinimums: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setFeeRecipient(
      _feeRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setOptionCatalogue(
      _catalogue: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setPoolFee(
      asset: string,
      fee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setPricer(
      _pricer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setTradeSizeLimits(
      _minTradeSize: BigNumberish,
      _maxTradeSize: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    strikeAsset(overrides?: CallOverrides): Promise<[string]>;

    swapRouter(overrides?: CallOverrides): Promise<[string]>;

    underlyingAsset(overrides?: CallOverrides): Promise<[string]>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    update(overrides?: CallOverrides): Promise<[BigNumber]>;

    withdraw(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addressbook(overrides?: CallOverrides): Promise<string>;

  approvedCollateral(
    arg0: string,
    arg1: boolean,
    overrides?: CallOverrides
  ): Promise<boolean>;

  authority(overrides?: CallOverrides): Promise<string>;

  catalogue(overrides?: CallOverrides): Promise<string>;

  changeApprovedCollateral(
    collateral: string,
    isPut: boolean,
    isApproved: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  checkHash(
    optionSeries: Types.OptionSeriesStruct,
    strikeDecimalConverted: BigNumberish,
    isSell: boolean,
    overrides?: CallOverrides
  ): Promise<string>;

  collateralAsset(overrides?: CallOverrides): Promise<string>;

  createOtoken(
    optionSeries: Types.OptionSeriesStruct,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  feeRecipient(overrides?: CallOverrides): Promise<string>;

  formatStrikePrice(
    strikePrice: BigNumberish,
    collateral: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getDelta(overrides?: CallOverrides): Promise<BigNumber>;

  getOptionDetails(
    seriesAddress: string,
    optionSeries: Types.OptionSeriesStruct,
    overrides?: CallOverrides
  ): Promise<[string, Types.OptionSeriesStructOutput, BigNumber]>;

  getPoolDenominatedValue(overrides?: CallOverrides): Promise<BigNumber>;

  getPortfolioValuesFeed(overrides?: CallOverrides): Promise<string>;

  hedgeDelta(
    _delta: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  heldTokens(
    arg0: string,
    arg1: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  liquidityPool(overrides?: CallOverrides): Promise<string>;

  maxTradeSize(overrides?: CallOverrides): Promise<BigNumber>;

  migrateOtokens(
    newOptionExchange: string,
    otokens: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  minTradeSize(overrides?: CallOverrides): Promise<BigNumber>;

  operate(
    _operationProcedures: CombinedActions.OperationProceduresStruct[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  pause(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  paused(overrides?: CallOverrides): Promise<boolean>;

  poolFees(arg0: string, overrides?: CallOverrides): Promise<number>;

  pricer(overrides?: CallOverrides): Promise<string>;

  protocol(overrides?: CallOverrides): Promise<string>;

  redeem(
    _series: string[],
    amountOutMinimums: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setAuthority(
    _newAuthority: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setFeeRecipient(
    _feeRecipient: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setOptionCatalogue(
    _catalogue: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setPoolFee(
    asset: string,
    fee: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setPricer(
    _pricer: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setTradeSizeLimits(
    _minTradeSize: BigNumberish,
    _maxTradeSize: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  strikeAsset(overrides?: CallOverrides): Promise<string>;

  swapRouter(overrides?: CallOverrides): Promise<string>;

  underlyingAsset(overrides?: CallOverrides): Promise<string>;

  unpause(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  update(overrides?: CallOverrides): Promise<BigNumber>;

  withdraw(
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addressbook(overrides?: CallOverrides): Promise<string>;

    approvedCollateral(
      arg0: string,
      arg1: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    authority(overrides?: CallOverrides): Promise<string>;

    catalogue(overrides?: CallOverrides): Promise<string>;

    changeApprovedCollateral(
      collateral: string,
      isPut: boolean,
      isApproved: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    checkHash(
      optionSeries: Types.OptionSeriesStruct,
      strikeDecimalConverted: BigNumberish,
      isSell: boolean,
      overrides?: CallOverrides
    ): Promise<string>;

    collateralAsset(overrides?: CallOverrides): Promise<string>;

    createOtoken(
      optionSeries: Types.OptionSeriesStruct,
      overrides?: CallOverrides
    ): Promise<string>;

    feeRecipient(overrides?: CallOverrides): Promise<string>;

    formatStrikePrice(
      strikePrice: BigNumberish,
      collateral: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDelta(overrides?: CallOverrides): Promise<BigNumber>;

    getOptionDetails(
      seriesAddress: string,
      optionSeries: Types.OptionSeriesStruct,
      overrides?: CallOverrides
    ): Promise<[string, Types.OptionSeriesStructOutput, BigNumber]>;

    getPoolDenominatedValue(overrides?: CallOverrides): Promise<BigNumber>;

    getPortfolioValuesFeed(overrides?: CallOverrides): Promise<string>;

    hedgeDelta(
      _delta: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    heldTokens(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    liquidityPool(overrides?: CallOverrides): Promise<string>;

    maxTradeSize(overrides?: CallOverrides): Promise<BigNumber>;

    migrateOtokens(
      newOptionExchange: string,
      otokens: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    minTradeSize(overrides?: CallOverrides): Promise<BigNumber>;

    operate(
      _operationProcedures: CombinedActions.OperationProceduresStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    pause(overrides?: CallOverrides): Promise<void>;

    paused(overrides?: CallOverrides): Promise<boolean>;

    poolFees(arg0: string, overrides?: CallOverrides): Promise<number>;

    pricer(overrides?: CallOverrides): Promise<string>;

    protocol(overrides?: CallOverrides): Promise<string>;

    redeem(
      _series: string[],
      amountOutMinimums: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    setAuthority(
      _newAuthority: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setFeeRecipient(
      _feeRecipient: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setOptionCatalogue(
      _catalogue: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setPoolFee(
      asset: string,
      fee: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setPricer(_pricer: string, overrides?: CallOverrides): Promise<void>;

    setTradeSizeLimits(
      _minTradeSize: BigNumberish,
      _maxTradeSize: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    strikeAsset(overrides?: CallOverrides): Promise<string>;

    swapRouter(overrides?: CallOverrides): Promise<string>;

    underlyingAsset(overrides?: CallOverrides): Promise<string>;

    unpause(overrides?: CallOverrides): Promise<void>;

    update(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {
    "AuthorityUpdated(address)"(authority?: null): AuthorityUpdatedEventFilter;
    AuthorityUpdated(authority?: null): AuthorityUpdatedEventFilter;

    "CollateralApprovalChanged(address,bool,bool)"(
      collateral?: string | null,
      isPut?: null,
      isApproved?: null
    ): CollateralApprovalChangedEventFilter;
    CollateralApprovalChanged(
      collateral?: string | null,
      isPut?: null,
      isApproved?: null
    ): CollateralApprovalChangedEventFilter;

    "OptionsBought(address,address,uint256)"(
      series?: string | null,
      buyer?: string | null,
      optionAmount?: null
    ): OptionsBoughtEventFilter;
    OptionsBought(
      series?: string | null,
      buyer?: string | null,
      optionAmount?: null
    ): OptionsBoughtEventFilter;

    "OptionsIssued(address)"(series?: string | null): OptionsIssuedEventFilter;
    OptionsIssued(series?: string | null): OptionsIssuedEventFilter;

    "OptionsRedeemed(address,uint256,uint256,address)"(
      series?: string | null,
      optionAmount?: null,
      redeemAmount?: null,
      redeemAsset?: null
    ): OptionsRedeemedEventFilter;
    OptionsRedeemed(
      series?: string | null,
      optionAmount?: null,
      redeemAmount?: null,
      redeemAsset?: null
    ): OptionsRedeemedEventFilter;

    "OptionsSold(address,address,uint256)"(
      series?: string | null,
      seller?: string | null,
      optionAmount?: null
    ): OptionsSoldEventFilter;
    OptionsSold(
      series?: string | null,
      seller?: string | null,
      optionAmount?: null
    ): OptionsSoldEventFilter;

    "OtokenMigrated(address,address,uint256)"(
      newOptionExchange?: null,
      otoken?: null,
      amount?: null
    ): OtokenMigratedEventFilter;
    OtokenMigrated(
      newOptionExchange?: null,
      otoken?: null,
      amount?: null
    ): OtokenMigratedEventFilter;

    "Paused(address)"(account?: null): PausedEventFilter;
    Paused(account?: null): PausedEventFilter;

    "RedemptionSent(uint256,address,address)"(
      redeemAmount?: null,
      redeemAsset?: null,
      recipient?: null
    ): RedemptionSentEventFilter;
    RedemptionSent(
      redeemAmount?: null,
      redeemAsset?: null,
      recipient?: null
    ): RedemptionSentEventFilter;

    "Unpaused(address)"(account?: null): UnpausedEventFilter;
    Unpaused(account?: null): UnpausedEventFilter;
  };

  estimateGas: {
    addressbook(overrides?: CallOverrides): Promise<BigNumber>;

    approvedCollateral(
      arg0: string,
      arg1: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    authority(overrides?: CallOverrides): Promise<BigNumber>;

    catalogue(overrides?: CallOverrides): Promise<BigNumber>;

    changeApprovedCollateral(
      collateral: string,
      isPut: boolean,
      isApproved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    checkHash(
      optionSeries: Types.OptionSeriesStruct,
      strikeDecimalConverted: BigNumberish,
      isSell: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    collateralAsset(overrides?: CallOverrides): Promise<BigNumber>;

    createOtoken(
      optionSeries: Types.OptionSeriesStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    feeRecipient(overrides?: CallOverrides): Promise<BigNumber>;

    formatStrikePrice(
      strikePrice: BigNumberish,
      collateral: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDelta(overrides?: CallOverrides): Promise<BigNumber>;

    getOptionDetails(
      seriesAddress: string,
      optionSeries: Types.OptionSeriesStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPoolDenominatedValue(overrides?: CallOverrides): Promise<BigNumber>;

    getPortfolioValuesFeed(overrides?: CallOverrides): Promise<BigNumber>;

    hedgeDelta(
      _delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    heldTokens(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    liquidityPool(overrides?: CallOverrides): Promise<BigNumber>;

    maxTradeSize(overrides?: CallOverrides): Promise<BigNumber>;

    migrateOtokens(
      newOptionExchange: string,
      otokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    minTradeSize(overrides?: CallOverrides): Promise<BigNumber>;

    operate(
      _operationProcedures: CombinedActions.OperationProceduresStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

    poolFees(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    pricer(overrides?: CallOverrides): Promise<BigNumber>;

    protocol(overrides?: CallOverrides): Promise<BigNumber>;

    redeem(
      _series: string[],
      amountOutMinimums: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setFeeRecipient(
      _feeRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setOptionCatalogue(
      _catalogue: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setPoolFee(
      asset: string,
      fee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setPricer(
      _pricer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setTradeSizeLimits(
      _minTradeSize: BigNumberish,
      _maxTradeSize: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    strikeAsset(overrides?: CallOverrides): Promise<BigNumber>;

    swapRouter(overrides?: CallOverrides): Promise<BigNumber>;

    underlyingAsset(overrides?: CallOverrides): Promise<BigNumber>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    update(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addressbook(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    approvedCollateral(
      arg0: string,
      arg1: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    authority(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    catalogue(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    changeApprovedCollateral(
      collateral: string,
      isPut: boolean,
      isApproved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    checkHash(
      optionSeries: Types.OptionSeriesStruct,
      strikeDecimalConverted: BigNumberish,
      isSell: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    collateralAsset(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    createOtoken(
      optionSeries: Types.OptionSeriesStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    feeRecipient(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    formatStrikePrice(
      strikePrice: BigNumberish,
      collateral: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDelta(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOptionDetails(
      seriesAddress: string,
      optionSeries: Types.OptionSeriesStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPoolDenominatedValue(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPortfolioValuesFeed(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    hedgeDelta(
      _delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    heldTokens(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    liquidityPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    maxTradeSize(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    migrateOtokens(
      newOptionExchange: string,
      otokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    minTradeSize(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    operate(
      _operationProcedures: CombinedActions.OperationProceduresStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poolFees(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    pricer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    protocol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    redeem(
      _series: string[],
      amountOutMinimums: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setFeeRecipient(
      _feeRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setOptionCatalogue(
      _catalogue: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setPoolFee(
      asset: string,
      fee: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setPricer(
      _pricer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setTradeSizeLimits(
      _minTradeSize: BigNumberish,
      _maxTradeSize: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    strikeAsset(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    swapRouter(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    underlyingAsset(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    update(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdraw(
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
