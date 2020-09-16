const LoggingLevel = {
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  ERROR: 'ERROR',
} as const;
type LoggingLevel = typeof LoggingLevel[keyof typeof LoggingLevel];

export function logger(loggingLevel: LoggingLevel, name: string, message: string) {
  const formattedLoggingLevel = `[${loggingLevel}]`.padEnd(7, ' ');
  console.log(`${formattedLoggingLevel} ${new Date().toString()} | ${name} | ${message}`);
}