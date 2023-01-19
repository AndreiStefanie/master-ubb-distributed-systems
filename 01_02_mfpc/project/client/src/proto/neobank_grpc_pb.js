// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var neobank_pb = require('./neobank_pb.js');

function serialize_neobank_AccountResponse(arg) {
  if (!(arg instanceof neobank_pb.AccountResponse)) {
    throw new Error('Expected argument of type neobank.AccountResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_neobank_AccountResponse(buffer_arg) {
  return neobank_pb.AccountResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_neobank_GetAccountRequest(arg) {
  if (!(arg instanceof neobank_pb.GetAccountRequest)) {
    throw new Error('Expected argument of type neobank.GetAccountRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_neobank_GetAccountRequest(buffer_arg) {
  return neobank_pb.GetAccountRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_neobank_ListAccountsRequest(arg) {
  if (!(arg instanceof neobank_pb.ListAccountsRequest)) {
    throw new Error('Expected argument of type neobank.ListAccountsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_neobank_ListAccountsRequest(buffer_arg) {
  return neobank_pb.ListAccountsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_neobank_ListAccountsResponse(arg) {
  if (!(arg instanceof neobank_pb.ListAccountsResponse)) {
    throw new Error('Expected argument of type neobank.ListAccountsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_neobank_ListAccountsResponse(buffer_arg) {
  return neobank_pb.ListAccountsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_neobank_OperationRequest(arg) {
  if (!(arg instanceof neobank_pb.OperationRequest)) {
    throw new Error('Expected argument of type neobank.OperationRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_neobank_OperationRequest(buffer_arg) {
  return neobank_pb.OperationRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var AccountServiceService = exports.AccountServiceService = {
  list: {
    path: '/neobank.AccountService/List',
    requestStream: false,
    responseStream: false,
    requestType: neobank_pb.ListAccountsRequest,
    responseType: neobank_pb.ListAccountsResponse,
    requestSerialize: serialize_neobank_ListAccountsRequest,
    requestDeserialize: deserialize_neobank_ListAccountsRequest,
    responseSerialize: serialize_neobank_ListAccountsResponse,
    responseDeserialize: deserialize_neobank_ListAccountsResponse,
  },
  get: {
    path: '/neobank.AccountService/Get',
    requestStream: false,
    responseStream: false,
    requestType: neobank_pb.GetAccountRequest,
    responseType: neobank_pb.AccountResponse,
    requestSerialize: serialize_neobank_GetAccountRequest,
    requestDeserialize: deserialize_neobank_GetAccountRequest,
    responseSerialize: serialize_neobank_AccountResponse,
    responseDeserialize: deserialize_neobank_AccountResponse,
  },
  deposit: {
    path: '/neobank.AccountService/Deposit',
    requestStream: false,
    responseStream: false,
    requestType: neobank_pb.OperationRequest,
    responseType: neobank_pb.AccountResponse,
    requestSerialize: serialize_neobank_OperationRequest,
    requestDeserialize: deserialize_neobank_OperationRequest,
    responseSerialize: serialize_neobank_AccountResponse,
    responseDeserialize: deserialize_neobank_AccountResponse,
  },
  withdraw: {
    path: '/neobank.AccountService/Withdraw',
    requestStream: false,
    responseStream: false,
    requestType: neobank_pb.OperationRequest,
    responseType: neobank_pb.AccountResponse,
    requestSerialize: serialize_neobank_OperationRequest,
    requestDeserialize: deserialize_neobank_OperationRequest,
    responseSerialize: serialize_neobank_AccountResponse,
    responseDeserialize: deserialize_neobank_AccountResponse,
  },
};

exports.AccountServiceClient = grpc.makeGenericClientConstructor(AccountServiceService);
