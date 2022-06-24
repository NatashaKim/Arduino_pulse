// ===========================
// Webpack Server With Node.js
// ===========================

const express = require('express')
const expressWs = require('express-ws')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')

const app = express()
const config = require('./webpack.config.js')
const compiler = webpack(config)

let ws = null

expressWs(app)

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  })
)

// websocket handler
app.ws('/websocket', (socket, req) => {
  console.log('websocket init')
  ws = socket

  socket.on('message', (msg) => {
    socket.send(msg)
  })
})

// Serve the files on port 3000.
app.listen(3000, () => {
  console.log('Example app listening on port 3000!\n')
})

// ===========================
// SerialPort Data Stream
// ===========================

const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const serialPort = new SerialPort({
  path: '/dev/tty.usbmodem14301',
  baudRate: 9600
})

const lineStream = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }))

lineStream.on('data', (data) => {
  if (ws) {
    const dataString = data.toString()

    ws.send(dataString)
    // console.log(dataString);
  }
})

// Read data that is available but keep the stream in "paused mode"
// serialPort.on("readable", function () {
//   if (ws) {
//     const data = serialPort.read();
//     const dataString = data.toString();
//
//     ws.send(dataString);
//     // console.log(dataString);
//   }
// });

// Switches the port into "flowing mode"
// serialPort.on("data", (data) => {
//   if (ws) {
//     const dataString = data.toString();
//
//     ws.send(dataString);
//     console.log(dataString);
//   }
// });

// Pipe the data into another stream (like a parser or standard out)
// const lineStream = serialPort.pipe(new ReadlineParser());
// const lineStream = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));
