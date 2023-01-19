import { Argv } from 'yargs';

export const command = 'accounts <command>';
export const describe = 'Manage your accounts';
export const builder = (yargs: Argv) =>
  yargs.commandDir('account_cmds', {
    extensions: ['js', 'ts'],
  });
export const handler = function () {};
