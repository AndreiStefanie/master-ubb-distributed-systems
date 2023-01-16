// package: neobank
// file: neobank.proto

import * as grpc from '@grpc/grpc-js';
import * as neobank_pb from './neobank_pb';

interface IAccountServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  get: IAccountServiceService_IGet;
  deposit: IAccountServiceService_IDeposit;
  withdraw: IAccountServiceService_IWithdraw;
}

interface IAccountServiceService_IGet extends grpc.MethodDefinition<neobank_pb.GetAccountRequest, neobank_pb.AccountResponse> {
  path: '/neobank.AccountService/Get'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<neobank_pb.GetAccountRequest>;
  requestDeserialize: grpc.deserialize<neobank_pb.GetAccountRequest>;
  responseSerialize: grpc.serialize<neobank_pb.AccountResponse>;
  responseDeserialize: grpc.deserialize<neobank_pb.AccountResponse>;
}

interface IAccountServiceService_IDeposit extends grpc.MethodDefinition<neobank_pb.OperationRequest, neobank_pb.AccountResponse> {
  path: '/neobank.AccountService/Deposit'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<neobank_pb.OperationRequest>;
  requestDeserialize: grpc.deserialize<neobank_pb.OperationRequest>;
  responseSerialize: grpc.serialize<neobank_pb.AccountResponse>;
  responseDeserialize: grpc.deserialize<neobank_pb.AccountResponse>;
}

interface IAccountServiceService_IWithdraw extends grpc.MethodDefinition<neobank_pb.OperationRequest, neobank_pb.AccountResponse> {
  path: '/neobank.AccountService/Withdraw'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<neobank_pb.OperationRequest>;
  requestDeserialize: grpc.deserialize<neobank_pb.OperationRequest>;
  responseSerialize: grpc.serialize<neobank_pb.AccountResponse>;
  responseDeserialize: grpc.deserialize<neobank_pb.AccountResponse>;
}

export const AccountServiceService: IAccountServiceService;
export interface IAccountServiceServer extends grpc.UntypedServiceImplementation {
  get: grpc.handleUnaryCall<neobank_pb.GetAccountRequest, neobank_pb.AccountResponse>;
  deposit: grpc.handleUnaryCall<neobank_pb.OperationRequest, neobank_pb.AccountResponse>;
  withdraw: grpc.handleUnaryCall<neobank_pb.OperationRequest, neobank_pb.AccountResponse>;
}

export interface IAccountServiceClient {
  get(request: neobank_pb.GetAccountRequest, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  get(request: neobank_pb.GetAccountRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  get(request: neobank_pb.GetAccountRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  deposit(request: neobank_pb.OperationRequest, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  deposit(request: neobank_pb.OperationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  deposit(request: neobank_pb.OperationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  withdraw(request: neobank_pb.OperationRequest, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  withdraw(request: neobank_pb.OperationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  withdraw(request: neobank_pb.OperationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
}

export class AccountServiceClient extends grpc.Client implements IAccountServiceClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
  public get(request: neobank_pb.GetAccountRequest, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  public get(request: neobank_pb.GetAccountRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  public get(request: neobank_pb.GetAccountRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  public deposit(request: neobank_pb.OperationRequest, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  public deposit(request: neobank_pb.OperationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  public deposit(request: neobank_pb.OperationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  public withdraw(request: neobank_pb.OperationRequest, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  public withdraw(request: neobank_pb.OperationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
  public withdraw(request: neobank_pb.OperationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: neobank_pb.AccountResponse) => void): grpc.ClientUnaryCall;
}

