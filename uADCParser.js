const { Transform } = require('stream')

/**
 * Emit data every number of bytes
 * @extends Transform
 * @param {Object} options parser options object
 * @param {Number} options.length the number of samples in each transmission
 * @summary A transform stream that emits data as a buffer after a specific number of bytes are received. Runs in O(n) time.
 * @example
const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new ByteLength({length: 8}))
parser.on('data', console.log) // will have 8 bytes per data event
 */
class uADCParser extends Transform {
  constructor(options = {}) {
    super(options)

    if (typeof options.length !== 'number') {
      throw new TypeError('"length" is not a number')
    }

    if (options.length < 1) {
      throw new TypeError('"length" is not greater than 0')
    }

    this.sdlength = options.length*2
    this.framelength = 2 + this.sdlength + 2;

    this.position = 0
    this.buffer = Buffer.alloc(this.sdlength)

    this.receiveBuffer = Buffer.alloc(0);
    this.sampleRate = 0
  }
  
  _transform(chunk, encoding, cb) {
    //Note: calling cb basically requests more data.
    let cursor = 0
    this.receiveBuffer = Buffer.concat([this.receiveBuffer, chunk])

    if(this.receiveBuffer.length < this.framelength){
      cb()
      return
    }

    while(true){
      // set the cursor to the next possible frame-start:
      let new_cursor = this.receiveBuffer.indexOf(0xbd, cursor)

      if(new_cursor == -1){
        console.log('stalling')
        this.receiveBuffer = Buffer.alloc(0)
        cb()
        return
      }
      cursor = new_cursor

      //check if we have enough data, if not, request more & exit
      if(this.receiveBuffer.length<(this.framelength + cursor)){
        //remove all possibly already processed data:
        this.receiveBuffer = this.receiveBuffer.slice(cursor)
        cb()
        return
      }

      // check if the selected frame is valid:
      let validFrame = this.receiveBuffer[cursor + this.framelength - 1] == 0xed
      while(!validFrame){
        //console.log("inv_frm", cursor)
        let new_cursor = this.receiveBuffer.indexOf(0xbd, cursor+1)

        if(new_cursor == -1){
          console.log('stalling')
          this.receiveBuffer = Buffer.alloc(0)
          cb()
          return
        }
        cursor = new_cursor

        //check if we have enough data, if not, request more & exit
        if(this.receiveBuffer.length<(this.framelength + cursor)){
          //remove all possibly already processed data:
          this.receiveBuffer = this.receiveBuffer.slice(cursor)
          cb()
          return
        }

        validFrame = this.receiveBuffer[cursor + this.framelength - 1] == 0xed
        // console.log("end __inv_frm__")
      }

      let frameData = this.receiveBuffer.slice(cursor, cursor+this.framelength)
      //console.log(this.receiveBuffer.length, cursor, frameData.length)
      this.push(frameData.slice(1, this.sdlength+1))

      //calculate sampleRate as a rolling-Average.
      this.sampleRate += (64/frameData.readUInt16LE(this.sdlength))*Math.pow(10, 6)
      this.sampleRate /= 2

      //increment the cursor, so the search is faster:
      cursor += this.framelength - 2
    }
  }

  _flush(cb) {
    this.push(this.buffer.slice(0, this.position))
    this.buffer = Buffer.alloc(this.sdlength)
    cb()
  }

}

module.exports = uADCParser
