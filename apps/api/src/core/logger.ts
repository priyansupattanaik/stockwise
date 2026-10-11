export interface StructuredLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  requestId?: string;
  module?: string;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  constructor(private readonly context: string = 'App') {}

  private log(
    level: StructuredLog['level'],
    message: string,
    data?: Record<string, any>,
    requestId?: string
  ) {
    const entry: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message: `[${this.context}] ${message}`,
      requestId,
      module: this.context,
      data,
    };
    if (level === 'error') {
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  info(message: string, data?: Record<string, any>, requestId?: string) {
    this.log('info', message, data, requestId);
  }

  warn(message: string, data?: Record<string, any>, requestId?: string) {
    this.log('warn', message, data, requestId);
  }

  error(message: string, err?: unknown, requestId?: string) {
    const errorData =
      err instanceof Error
        ? {
            name: err.name,
            message: err.message,
            stack: err.stack,
          }
        : { raw: String(err) };

    const entry: StructuredLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `[${this.context}] ${message}`,
      requestId,
      module: this.context,
      error: errorData as any,
    };
    console.error(JSON.stringify(entry));
  }
}
