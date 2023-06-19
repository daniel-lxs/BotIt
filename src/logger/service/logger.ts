import colors from 'colors';

import { LogContext } from '../model/LogContext';
import { LogDomain } from '../model/LogDomain';

export function logger(
  context: LogContext,
  message: string,
  domain?: LogDomain
): void {
  let color;

  switch (context) {
    case LogContext.Info:
      color = colors.cyan;
      break;
    case LogContext.Warning:
      color = colors.yellow;
      break;
    case LogContext.Error:
      color = colors.red.bold;
      break;
    default:
      color = colors.white;
      break;
  }

  let formattedMessage = `[${context}]`;
  if (domain) {
    formattedMessage += ` ${getDomainColor(domain)(`[${domain}]`)}`;
  }

  formattedMessage += ` ${message}`;
  console.log(color(formattedMessage));
}

function getDomainColor(domain: LogDomain): any {
  switch (domain) {
    case LogDomain.Reddit:
      return colors.dim.red;
    case LogDomain.Lemmy:
      return colors.dim.blue;
    case LogDomain.Scheduler:
      return colors.dim.green;
    default:
      return colors.dim.white;
  }
}
