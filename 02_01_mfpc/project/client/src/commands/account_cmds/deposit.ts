import type { Arguments, CommandBuilder } from 'yargs';

import { deposit } from '../../services/accounts';

type Options = {
  account: number;
  amount: number;
};

export const command = 'deposit <account> <amount>';
export const describe = 'Deposit money to your account';
export const builder: CommandBuilder<Options, Options> = yargs =>
  yargs
    .positional('account', { type: 'number', demandOption: true })
    .positional('amount', { type: 'number', demandOption: true });
export const handler = (argv: Arguments<Options>): void => {
  deposit(argv.account, argv.amount);
};
