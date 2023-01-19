import type { Arguments, CommandBuilder } from 'yargs';

import { listAccounts } from '../../services/accounts';

export const command = 'list';
export const describe = 'List your accounts';
export const builder: CommandBuilder = {};
export const handler = (argv: Arguments): void => {
  listAccounts();
};
