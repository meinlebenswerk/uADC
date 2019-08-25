const SerialPort = require('serialport')
const port = new SerialPort('COM7', { baudRate: 1000000})

const uADC = require('./uADC');

const NSAMPLES = 64

const parser = port.pipe(new uADC.uADCStreamParser({ length: NSAMPLES }))
port.on('open', () => {console.log('port open.')})

parser.on('data', (data) => console.log(data))
