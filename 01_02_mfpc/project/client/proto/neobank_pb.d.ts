// package: neobank
// file: neobank.proto

import * as jspb from 'google-protobuf';

export class User extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getUsername(): string;
  setUsername(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): User.AsObject;
  static toObject(includeInstance: boolean, msg: User): User.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: User, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): User;
  static deserializeBinaryFromReader(message: User, reader: jspb.BinaryReader): User;
}

export namespace User {
  export type AsObject = {
    id: number,
    username: string,
  }
}

export class Account extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getUserid(): number;
  setUserid(value: number): void;

  getBalance(): number;
  setBalance(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Account.AsObject;
  static toObject(includeInstance: boolean, msg: Account): Account.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Account, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Account;
  static deserializeBinaryFromReader(message: Account, reader: jspb.BinaryReader): Account;
}

export namespace Account {
  export type AsObject = {
    id: number,
    userid: number,
    balance: number,
  }
}

export class GetAccountRequest extends jspb.Message {
  getAccountid(): number;
  setAccountid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAccountRequest): GetAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAccountRequest;
  static deserializeBinaryFromReader(message: GetAccountRequest, reader: jspb.BinaryReader): GetAccountRequest;
}

export namespace GetAccountRequest {
  export type AsObject = {
    accountid: number,
  }
}

export class AccountResponse extends jspb.Message {
  hasAccount(): boolean;
  clearAccount(): void;
  getAccount(): Account | undefined;
  setAccount(value?: Account): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AccountResponse): AccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountResponse;
  static deserializeBinaryFromReader(message: AccountResponse, reader: jspb.BinaryReader): AccountResponse;
}

export namespace AccountResponse {
  export type AsObject = {
    account?: Account.AsObject,
  }
}

export class OperationRequest extends jspb.Message {
  getAccountid(): number;
  setAccountid(value: number): void;

  getAmount(): number;
  setAmount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OperationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: OperationRequest): OperationRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OperationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OperationRequest;
  static deserializeBinaryFromReader(message: OperationRequest, reader: jspb.BinaryReader): OperationRequest;
}

export namespace OperationRequest {
  export type AsObject = {
    accountid: number,
    amount: number,
  }
}

