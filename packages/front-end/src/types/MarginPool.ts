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
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface MarginPoolInterface extends utils.Interface {
  functions: {
    "addressBook()": FunctionFragment;
    "batchTransferToPool(address[],address[],uint256[])": FunctionFragment;
    "batchTransferToUser(address[],address[],uint256[])": FunctionFragment;
    "farm(address,address,uint256)": FunctionFragment;
    "farmer()": FunctionFragment;
    "getStoredBalance(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setFarmer(address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "transferToPool(address,address,uint256)": FunctionFragment;
    "transferToUser(address,address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addressBook",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "batchTransferToPool",
    values: [string[], string[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "batchTransferToUser",
    values: [string[], string[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "farm",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "farmer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getStoredBalance",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "setFarmer", values: [string]): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "transferToPool",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferToUser",
    values: [string, string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "addressBook",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "batchTransferToPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "batchTransferToUser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "farm", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "farmer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getStoredBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setFarmer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferToPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferToUser",
    data: BytesLike
  ): Result;

  events: {
    "AssetFarmed(address,address,uint256)": EventFragment;
    "FarmerUpdated(address,address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "TransferToPool(address,address,uint256)": EventFragment;
    "TransferToUser(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AssetFarmed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FarmerUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferToPool"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferToUser"): EventFragment;
}

export type AssetFarmedEvent = TypedEvent<
  [string, string, BigNumber],
  { asset: string; receiver: string; amount: BigNumber }
>;

export type AssetFarmedEventFilter = TypedEventFilter<AssetFarmedEvent>;

export type FarmerUpdatedEvent = TypedEvent<
  [string, string],
  { oldAddress: string; newAddress: string }
>;

export type FarmerUpdatedEventFilter = TypedEventFilter<FarmerUpdatedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export type TransferToPoolEvent = TypedEvent<
  [string, string, BigNumber],
  { asset: string; user: string; amount: BigNumber }
>;

export type TransferToPoolEventFilter = TypedEventFilter<TransferToPoolEvent>;

export type TransferToUserEvent = TypedEvent<
  [string, string, BigNumber],
  { asset: string; user: string; amount: BigNumber }
>;

export type TransferToUserEventFilter = TypedEventFilter<TransferToUserEvent>;

export interface MarginPool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MarginPoolInterface;

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

    batchTransferToPool(
      _asset: string[],
      _user: string[],
      _amount: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    batchTransferToUser(
      _asset: string[],
      _user: string[],
      _amount: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    farm(
      _asset: string,
      _receiver: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    farmer(overrides?: CallOverrides): Promise<[string]>;

    getStoredBalance(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setFarmer(
      _farmer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferToPool(
      _asset: string,
      _user: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferToUser(
      _asset: string,
      _user: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addressBook(overrides?: CallOverrides): Promise<string>;

  batchTransferToPool(
    _asset: string[],
    _user: string[],
    _amount: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  batchTransferToUser(
    _asset: string[],
    _user: string[],
    _amount: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  farm(
    _asset: string,
    _receiver: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  farmer(overrides?: CallOverrides): Promise<string>;

  getStoredBalance(
    _asset: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setFarmer(
    _farmer: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferToPool(
    _asset: string,
    _user: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferToUser(
    _asset: string,
    _user: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addressBook(overrides?: CallOverrides): Promise<string>;

    batchTransferToPool(
      _asset: string[],
      _user: string[],
      _amount: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    batchTransferToUser(
      _asset: string[],
      _user: string[],
      _amount: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    farm(
      _asset: string,
      _receiver: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    farmer(overrides?: CallOverrides): Promise<string>;

    getStoredBalance(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setFarmer(_farmer: string, overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    transferToPool(
      _asset: string,
      _user: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    transferToUser(
      _asset: string,
      _user: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "AssetFarmed(address,address,uint256)"(
      asset?: string | null,
      receiver?: string | null,
      amount?: null
    ): AssetFarmedEventFilter;
    AssetFarmed(
      asset?: string | null,
      receiver?: string | null,
      amount?: null
    ): AssetFarmedEventFilter;

    "FarmerUpdated(address,address)"(
      oldAddress?: string | null,
      newAddress?: string | null
    ): FarmerUpdatedEventFilter;
    FarmerUpdated(
      oldAddress?: string | null,
      newAddress?: string | null
    ): FarmerUpdatedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;

    "TransferToPool(address,address,uint256)"(
      asset?: string | null,
      user?: string | null,
      amount?: null
    ): TransferToPoolEventFilter;
    TransferToPool(
      asset?: string | null,
      user?: string | null,
      amount?: null
    ): TransferToPoolEventFilter;

    "TransferToUser(address,address,uint256)"(
      asset?: string | null,
      user?: string | null,
      amount?: null
    ): TransferToUserEventFilter;
    TransferToUser(
      asset?: string | null,
      user?: string | null,
      amount?: null
    ): TransferToUserEventFilter;
  };

  estimateGas: {
    addressBook(overrides?: CallOverrides): Promise<BigNumber>;

    batchTransferToPool(
      _asset: string[],
      _user: string[],
      _amount: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    batchTransferToUser(
      _asset: string[],
      _user: string[],
      _amount: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    farm(
      _asset: string,
      _receiver: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    farmer(overrides?: CallOverrides): Promise<BigNumber>;

    getStoredBalance(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setFarmer(
      _farmer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferToPool(
      _asset: string,
      _user: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferToUser(
      _asset: string,
      _user: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addressBook(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    batchTransferToPool(
      _asset: string[],
      _user: string[],
      _amount: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    batchTransferToUser(
      _asset: string[],
      _user: string[],
      _amount: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    farm(
      _asset: string,
      _receiver: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    farmer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getStoredBalance(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setFarmer(
      _farmer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferToPool(
      _asset: string,
      _user: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferToUser(
      _asset: string,
      _user: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
