use strict;

import { logger } from './Logger';

export class Logger {
  public info(message: string, ...args: any[]): void {
    console.log(`[${new Date().toISOString()}] INFO: ${this.formatMessage(message, args)}`);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[${new Date().toISOString()}] WARN: ${this.formatMessage(message, args)}`);
  }

  public error(message: string | Error, ...args: any[]): void {
    if (message instanceof Error) {
      console.error(`[${new Date().toISOString()}] ERROR: ${message.message}`);
      if (message.stack) console.error(message.stack);
    } else {
      console.error(`[${new Date().toISOString()}] ERROR: ${this.formatMessage(message, args)}`);
    }
  }

  private formatMessage(message: string, args: any[]): string {
    return args.length > 0 ? message.replace(/\{(\d+)\}/g, (_, index) => String(args[parseInt(index)]) || '') : message;
  }
}

export const logger = new Logger();