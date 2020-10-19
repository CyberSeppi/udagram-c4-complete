import * as winston from 'winston'



enum LOGLEVELS {
  INFO,
  ERROR
}

let logger: winston.Logger;
/**
 * Create a logger instance to write log messages in JSON format.
 *
 * @param loggerName - a name of a logger that will be added to all messages
 */
export function createLogger(loggerName: string) {
  return winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { name: loggerName },
    transports: [
      new winston.transports.Console()
    ]
  })
}


function log(loglevel: LOGLEVELS, loggerName: string, msg: string, params?: any) {
  if (!logger) {
    logger = createLogger(loggerName)
  }

  let logMsg = msg

  if (params) {
    if (({}).constructor === params.constructor) {
      let paramAsText = JSON.stringify(params)
      logMsg = logMsg.concat(' Params: ').concat(paramAsText)
    } else {
      logMsg.concat(params)
    }
  }


  switch (loglevel) {
    case LOGLEVELS.INFO:
      logger.info(logMsg)
      break;
    case LOGLEVELS.ERROR:
      logger.error(logMsg)
      break;
    default:
      throw Error(`Loglevel ${loglevel} not known`)
  }
}

/**
 * This is a helper function, because the winston logger won't concatenate the msg with the params due to a bug
 * @param loggername Name of the logger
 * @param msg The log msg
 * @param params The params to the log msg
 */
export function logInfo(loggername: string, msg: string, params?: any) {
  log(LOGLEVELS.INFO, loggername, msg, params)
}

/**
 * This is a helper function, because the winston logger won't concatenate the msg with the params due to a bug
 * @param loggername Name of the logger
 * @param msg The log msg
 * @param params The params to the log msg
 */
export function logError(loggername: string, msg: string, params?: any) {
  log(LOGLEVELS.ERROR, loggername, msg, params)
}