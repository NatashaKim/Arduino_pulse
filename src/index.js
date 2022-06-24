import './index.scss'
let radius = 100

let sketchData = {
  analog: 0,
  pulse: 0
}

var columns = 150
var rows = 50

var xSpace = 10
var ySpace = 20

var pivot

var radiusNoise
var noiseSpeed

let pgTextSize
let currentpgTextSize

var record = false

var lineCount = 3

var leading = 0.8
var currentLeading

var invert = false

var input
var splitInput = []
var iT = []
var currentInput

var foreCol, backCol
var radiusNoiseSlider
var inp
var bg
var bkgdCol

let tumult
let font0
let selectedFont
let repeatSize

import Roboto from './fonts/ADC-Semi-Bold.otf'
import First from './images/1.png'
import Second from './images/2.png'
import Third from './images/3.png'
import Fourth from './images/4.png'
import Fifth from './images/5.png'

// From https://habr.com/ru/post/516334/
export const wsConnection = new WebSocket('ws://localhost:3000/websocket')

wsConnection.onopen = function () {
  console.log('Соединение установлено.')
}

wsConnection.onclose = function (event) {
  if (event.wasClean) {
    console.log('Соединение закрыто чисто')
  } else {
    console.log('Обрыв соединения') // например, "убит" процесс сервера
  }
  console.log('Код: ' + event.code + ' причина: ' + event.reason)
}

wsConnection.onerror = function (error) {
  console.log('Ошибка ' + error.message)
}

wsConnection.onmessage = function message(event) {
  console.log('received: %s', event.data)
  // console.log(event.data);
  sketchData = JSON.parse(event.data)
  //radius = parseInt(event.data)
  console.log(sketchData)
  //radius = parseInt(event.data)
}

import p5 from 'p5'
// import { pulseData } from '../prototypes/prototype_47/pulse_data'

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min
}

let index1

class SliceObj {
  slImg
  slImg1
  slImg2
  slImg3
  slImg4
  xPos
  yPos
  xPosSt
  yPosSt
  pingLock
  done
  inSlice
  sprTarget
  sprVel
  p
  wth
  ht
  sprPingHt
  sprStrength
  sprDrag
  index

  constructor(index, xSt, ySt, wth, ht, img, img1, img2, img3, img4, p) {
    this.index = index
    this.slImg = img.get(wth * index, 0, wth, ht)
    this.slImg1 = img1.get(wth * index, 0, wth, ht)
    this.slImg2 = img2.get(wth * index, 0, wth, ht)
    this.slImg3 = img3.get(wth * index, 0, wth, ht)
    this.slImg4 = img4.get(wth * index, 0, wth, ht)
    this.xPos = xSt + wth * index
    this.yPos = ySt
    this.xPosSt = xSt
    this.yPosSt = ySt
    this.pingLock = false
    this.done = false
    this.inSlice = false
    this.sprTarget = ySt
    this.sprVel = 0
    this.p = p
    this.wth = wth
    this.ht = ht
    this.sprPingHt = 100
    this.sprStrength = 0.1
    this.sprDrag = 0.0
  }

  display(sNo) {
    if (sketchData.pulse <= 70) {
      this.p.image(this.slImg, this.xPos, this.yPos, this._wth, this._ht)
    } else if (70 < sketchData.pulse <= 75) {
      this.p.image(this.slImg1, this.xPos, this.yPos, this._wth, this._ht)
    } else if (75 < sketchData.pulse <= 80) {
      this.p.image(this.slImg2, this.xPos, this.yPos, this._wth, this._ht)
    } else if (80 < sketchData.pulse <= 85) {
      this.p.image(this.slImg3, this.xPos, this.yPos, this._wth, this._ht)
    } else {
      this.p.image(this.slImg4, this.xPos, this.yPos, this._wth, this._ht)
    }
  }

  update(sNo, mX, mY) {
    if (mX === this.index) {
      this.inSlice = true
    } else {
      this.inSlice = false
      this.pingLock = false
    }

    if (this.inSlice && !this.pingLock && this.done) {
      this.ping(sNo)
      this.spring(sNo)
    }

    if (this.inSlice && this.pingLock && !this.done) {
      this.spring(sNo)
    }

    if (!this.inSlice && !this.done) {
      this.spring(sNo)
    }
  }

  ping(sNo) {
    this.yPos = sketchData.analog / 2
    this.pingLock = true
  }

  spring(sNo) {
    this.done = true

    // spring simulation
    // if (this.p.int(this.yPos) != this.p.int(this.yPosSt)) {
    //   this.sprForce = this.sprTarget - this.yPos
    //   this.sprForce *= this.sprStrength
    //   this.sprVel *= this.sprDrag
    //   this.sprVel += this.sprForce
    //   this.yPos += this.sprVel
    // } else {
    //   this.done = true
    //   this.yPos = this.yPosSt
    // }
  } // fn  spring
}

class Sketch {
  slWidth
  slHeight
  slCount
  xPosStart
  yPosStart
  slices
  imageName
  imageName1
  imageName2
  imageName3
  imageName4
  fileName
  index
  index1

  constructor(
    imageName,
    imageName1,
    imageName2,
    imageName3,
    imageName4,
    frameName,
    window
  ) {
    this.slWidth = 10
    this.slHeight = 563
    this.slCount = 100
    this.xPosStart = 0
    this.yPosStart = 0
    this.slices = []
    this.imageName = imageName
    this.imageName1 = imageName1
    this.imageName2 = imageName2
    this.imageName3 = imageName3
    this.imageName4 = imageName4
    this.frameName = frameName
    this.index = 0
    index1 = 0

    window.setInterval(() => {
      this.nextIndex()
    }, 20)
  }

  origImg
  origImg1
  origImg2
  origImg3
  origImg4

  nextIndex() {
    this.index = this.index + 1
    if (this.index >= this.slices.length) {
      this.index = 0
    }
  }

  sketch(p) {
    p.preload = () => {
      this.origImg = p.loadImage(this.imageName)
      this.origImg1 = p.loadImage(this.imageName1)
      this.origImg2 = p.loadImage(this.imageName2)
      this.origImg3 = p.loadImage(this.imageName3)
      this.origImg4 = p.loadImage(this.imageName4)
    }
    p.setup = () => {
      const canvas = p.createCanvas(576, 800)
      canvas.parent(this.frameName)

      let gBgColor = p.color(236, 52, 40)
      p.background(gBgColor)

      for (let i = 0; i < this.slCount; i++) {
        this.slices[i] = new SliceObj(
          i,
          this.xPosStart,
          this.yPosStart,
          this.slWidth,
          this.slHeight,
          this.origImg,
          this.origImg1,
          this.origImg2,
          this.origImg3,
          this.origImg4,
          p
        )
      }
    }

    p.draw = () => {
      p.background('#FF0000')
      for (let i = 0; i < this.slCount; i++) {
        this.slices[i].display(i)
        this.slices[i].update(i, this.index, p.mouseY) //?
        //  slices[i].display(i);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.body
  let frame

  frame = document.createElement('div')
  frame.classList.add('frame')
  frame.id = 'frame'
  container.appendChild(frame)
  let sketch = new Sketch(First, Second, Third, Fourth, Fifth, 'frame', window)
  new p5((p) => sketch.sketch(p))

  // frame = document.createElement('div')
  // frame.classList.add('frame')
  // frame.id = 'frame1'
  // container.appendChild(frame)
  // sketch = new Sketch(
  //   First,
  //   'https://im.kommersant.ru/Issues.photo/WEEKEND/2018/029/KMO_116350_09425_1_t218_143316.jpg',
  //   'frame1',
  //   window
  // )
  // new p5((p) => sketch.sketch(p))

  ///

  frame = document.createElement('div')
  frame.classList.add('frame')
  frame.id = 'frame1'
  container.appendChild(frame)

  sketch = (p) => {
    p.preload = () => {
      font0 = p.loadFont(Roboto)
    }
    p.setup = () => {
      p.print('setup start')
      const canvas = p.createCanvas(864, 800, p.WEBGL)
      canvas.parent('frame1')

      bg = p.loadImage('/assets/try.png')

      p.frameRate(30)
      p.noSmooth()

      // radiusNoiseSlider = p.createSlider(0, 1, 0.25, 0.01)
      // radiusNoiseSlider.position(p.width / 2 + 650, 40)
      // radiusNoiseSlider.style('width', '140px')

      inp = p.createInput(
        'И ВОССТАНУТ|ТОГДА ОНИ ВСЕ|ИЗ МОГИЛ СВОИХ|И ПРИЗОВУТ НАС ВСЕХ|К ОТВЕТУ'
      )
      inp.position(p.width / 2 + 500, p.height - 123)
      inp.style('width', '150px')

      // pivot = -atan2(height,width);
      foreCol = p.color('#ffffff')
      bkgdCol = p.color('#000000')
    }

    p.draw = () => {
      p.clear()

      foreCol = p.color('#ffffff')
      bkgdCol = p.color('#000000')

      p.background(bkgdCol)

      noiseSpeed = 0.02
      radiusNoise = (sketchData.pulse / 300) * p.map(170, 0, 1, 0, 2)
      tumult = 2 * p.PI
      columns = 45
      rows = 45
      input = inp.value()
      pgTextSize = 80
      leading = 0.8

      if (
        input != currentInput ||
        leading != currentLeading ||
        pgTextSize != currentpgTextSize
      ) {
        p.createSplits()
        currentInput = input
        currentLeading = leading
        currentpgTextSize = pgTextSize
      }

      for (var z = 0; z < splitInput.length; z++) {
        p.push()
        //  rotateZ(pivot);
        var stripS = iT[z]
        p.textureMode(p.NORMAL)

        xSpace = stripS.width / columns
        ySpace = stripS.height / rows

        p.texture(stripS)
        p.translate(
          -stripS.width / 2,
          -stripS.height / 2 -
            (stripS.height * leading * (splitInput.length - 1)) / 2 +
            stripS.height * z * leading
        )

        for (var y = 0; y < rows; y++) {
          p.beginShape(p.TRIANGLE_STRIP)
          for (var x = 0; x <= columns; x++) {
            let baseSpot = p.dist(
              0,
              stripS.height,
              stripS.width,
              -stripS.height / 0.5
            )
            let currentSpot = p.dist(
              x * xSpace,
              y * ySpace,
              stripS.width,
              -stripS.height / 0.5
            )
            let distMap = p.map(currentSpot, 0, baseSpot, 1, 0)
            let radiusMap = p.easer(distMap) * radiusNoise

            let nextSpot = p.dist(
              x * xSpace,
              (y + 1) * ySpace,
              stripS.width,
              -stripS.height / 0.5
            )
            let distMapNext = p.map(nextSpot, 0, baseSpot, 1, 0)
            let radiusMapNext = p.easer(distMapNext) * radiusNoise

            let noiseAngle = p.map(
              p.noise(
                (x - noiseSpeed * 15 * p.frameCount) * 0.1,
                (y + z * rows + noiseSpeed * 5 * p.frameCount) * 0.1,
                p.frameCount * noiseSpeed
              ),
              0,
              1,
              -tumult,
              tumult
            )
            let noiseAngleNext = p.map(
              p.noise(
                (x - noiseSpeed * 15 * p.frameCount) * 0.1,
                (y + 1 + z * rows + noiseSpeed * 5 * p.frameCount) * 0.1,
                p.frameCount * noiseSpeed
              ),
              0,
              1,
              -tumult,
              tumult
            )

            let u = p.map(
              x * xSpace + p.sin(noiseAngle) * radiusMap,
              0,
              stripS.width,
              0,
              1
            )
            let vTop = p.map(
              y * ySpace + p.cos(noiseAngle) * radiusMap,
              0,
              stripS.height,
              0,
              1
            )
            let vBottom = p.map(
              (y + 1) * ySpace + p.cos(noiseAngleNext) * radiusMapNext,
              0,
              stripS.height,
              0,
              1
            )

            p.vertex(x * xSpace, y * ySpace, u, vTop)
            p.vertex(x * xSpace, (y + 1) * ySpace, u, vBottom)
          }
          p.endShape()
        }
        p.pop()
      }

      p.push()
      p.translate(-p.width / 2, -p.height / 2)

      p.fill(foreCol)
      p.pop()
    }

    p.createSplits = () => {
      foreCol = p.color('#ffffff')
      bkgdCol = p.color('#000000')

      splitInput = input.split('|')

      for (var i = 0; i < splitInput.length; i++) {
        p.createIndTexture(i, splitInput[i])
      }
    }

    p.easer = (step) => {
      var a = 4
      return p.pow(step, a) / (p.pow(step, a) + p.pow(1 - step, a))
    }

    // p.resetPreset = () => {
    //   noiseSpeedSlider.value(0.02) //50
    //   radiusNoiseSlider.value(0.25) //1
    //   tumultSlider.value(2 * PI) // 6*PI
    //   columnSlider.value(45)
    //   rowSlider.value(45) //150
    //   inp.value('ALL|GOOD|THINGS|I HOPE.')
    //   fontSizeSlider.value(10) //500
    //   leadingSlider.value(0.6) //2
    //   invertCheck.checked(false)
    // }

    p.createIndTexture = (i, indInput) => {
      selectedFont = font0

      p.textSize(pgTextSize)
      p.textFont(selectedFont)
      repeatSize = p.textWidth(indInput) * 1.015

      var textureWidth = repeatSize * 1.4
      var textureHeight = pgTextSize * 1.4

      var textNudgeDown = (pgTextSize * 0.7) / 2

      iT[i] = p.createGraphics(textureWidth, textureHeight)
      // iT[i].background(bg)
      iT[i].fill(foreCol)
      iT[i].noStroke()
      iT[i].textAlign(p.CENTER)
      iT[i].textSize(pgTextSize)
      iT[i].textFont(selectedFont)
      iT[i].translate(textureWidth / 2, textureHeight / 2 + textNudgeDown)
      //  v1.rotate(-PI/64);
      iT[i].text(indInput, 0, 0)
    }
  }

  let myp5 = new p5(sketch)

  // frame = document.createElement('div')
  // frame.classList.add('frame')
  // frame.id = 'frame2'
  // container.appendChild(frame)
  //
  // frame = document.createElement('div')
  // frame.classList.add('frame')
  // frame.id = 'frame3'
  // container.appendChild(frame)
  //
  // frame = document.createElement('div')
  // frame.classList.add('frame')
  // frame.id = 'frame4'
  // container.appendChild(frame)
})
