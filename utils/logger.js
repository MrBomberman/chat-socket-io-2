const { createLogger, transports, format} = require('winston');

const customFormat  = format.combine(format.timestamp(), format.printf((info) => {
    return `${(new Date()).toLocaleString('en-GB')} - [${info.level.toUpperCase()}] - ${info.message}`
}))

const logger = createLogger({
    format: customFormat,
    transports: [
        new transports.Console({level: 'silly'}),
        new transports.File({filename: 'chat.log'})
    ]
})

module.exports = logger;