const SerialPort = require('serialport')
const port = new SerialPort('COM7', { baudRate: 1000000})

const uADCParser = require('./uADCParser');

const NSAMPLES = 64

const parser = port.pipe(new uADCParser({ length: 64 }))
port.on('open', () => {console.log('port open.')})

let sample_parser = (chunk) => {
  let samples = []
  let samplerate = parser.sampleRate

  for(let i=0; i<NSAMPLES; i++){
    samples.push(chunk.readUInt16LE(i*2));
  }

  data = {
    samples: samples,
    sampleRate: samplerate
  }
  console.log(data)
  //console.log(`received new frame, approx. samplerate is: ${(parser.sampleRate/1000).toFixed(2)} ksps`)
}

parser.on('data', sample_parser)
