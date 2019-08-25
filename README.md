# uADC

A small project, that allows you to stream raw ADC-data from any Arduino compatible MCU to NodeJS via the nodejs-serialport module.

## Getting Started

### Prerequisites

To use uADC in a project, first you need to setup the Arduino-IDE and install the build-tools for the microcontroller you will be using.
In the IDE, just open the uADC_Arduino Project and flash it onto the your MCU.

### Installing in NodeJS

For the NodeJS-Project setup, install node-serialport and uADC (omit --save if you don't want to save the dependencies to you package.json):

```
npm i --save serialport uADC
```

The uADC-Module exports a Parser (uADCParser), which you can use in your projects:

```
const SerialPort = require('serialport')
const port = new SerialPort('COM7', { baudRate: 1000000})

const uADC = require('uADC');

const NSAMPLES = 64

const parser = port.pipe(new uADC.uADCStreamParser({ length: NSAMPLES }))
port.on('open', () => {console.log('port open.')})

parser.on('data', (data) => console.log(data))
```
This outputs the parsed sample-data to the console.

The sample-data object looks like this:
```
{
  //an array of samples
  samples : []
  // and an estimated samplerate in samples/sec
  sampleRate : Number
}
```

## Issues

Sometimes, the synchronization doesn't properly work, leading to a lot of missed packets, I am working on fixing that.

Also sometimes I don't get any data at all... This me be an issue with my BaudRate and setup, but so far I don't know. There is a fix for that though, just unplug your MCU and restart the application, if this doesn't help, just keep restarting the application... I know this is not very much of a fix, but I think i partially has to do with the sync-issue. 

## Built around

* [node-serialport](https://serialport.io/)
* [Arduino](https://www.arduino.cc/)


## Authors

* **Jan Eckert** - [meinlebenswerk](https://github.com/meinlebenswerk)

## License

This project is licensed under the MIT License

## Acknowledgments

* Tanks to whoever built the HB100 Radar-sensor which led me to develop this project ;)
