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
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface AccessControlInterface extends utils.Interface {
  functions: {
    "authority()": FunctionFragment;
    "setAuthority(address)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "authority", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setAuthority",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "authority", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setAuthority",
    data: BytesLike
  ): Result;

  events: {
    "AuthorityUpdated(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AuthorityUpdated"): EventFragment;
}

export type AuthorityUpdatedEvent = TypedEvent<[string], { authority: string }>;

export type AuthorityUpdatedEventFilter =
  TypedEventFilter<AuthorityUpdatedEvent>;

export interface AccessControl extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AccessControlInterface;

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

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  authority(overrides?: CallOverrides): Promise<string>;

  setAuthority(
    _newAuthority: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    authority(overrides?: CallOverrides): Promise<string>;

    setAuthority(
      _newAuthority: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "AuthorityUpdated(address)"(authority?: null): AuthorityUpdatedEventFilter;
    AuthorityUpdated(authority?: null): AuthorityUpdatedEventFilter;
  };

  estimateGas: {
    authority(overrides?: CallOverrides): Promise<BigNumber>;

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    authority(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setAuthority(
      _newAuthority: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
