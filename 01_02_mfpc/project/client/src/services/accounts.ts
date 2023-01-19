import { Metadata } from '@grpc/grpc-js';

import { AccountServiceClient } from '../proto/neobank_grpc_pb';
import { ListAccountsRequest, OperationRequest } from '../proto/neobank_pb';
import { loadTLSCredentials } from '../tls';

const credentials = loadTLSCredentials(true);

const accountClient = new AccountServiceClient('localhost:8080', credentials);

const userId = process.env.USER_ID || '1';

const getMetadata = () => {
  const meta = new Metadata();
  meta.set('user-id', userId);

  if (process.env.DELAY) {
    meta.set('delay', process.env.DELAY);
  }

  return meta;
};

export const listAccounts = () => {
  const req = new ListAccountsRequest();
  accountClient.list(req, getMetadata(), (error, response) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    console.table(response.getAccountsList().map(v => v.toObject()));
    process.exit(0);
  });
};

export const deposit = (accountId: number, amount: number) => {
  const req = new OperationRequest();
  req.setAccountid(accountId);
  req.setAmount(amount);

  accountClient.deposit(req, getMetadata(), (error, res) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    console.log(
      `Deposited ${amount}. New balance ${res.getAccount()?.getBalance()}`,
    );
    process.exit(0);
  });
};
