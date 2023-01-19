#!/usr/bin/env ts-node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .commandDir('./commands', {
    extensions: ['js', 'ts'],
  })
  .strict()
  .alias({ h: 'help' }).argv;
