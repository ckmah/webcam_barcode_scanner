// Copyright (c) 2013 Yury Delendik
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
let streaming = false;
let startAndStop = document.getElementById('startAndStop');
let videoInput = document.getElementById('videoInput');
var canvas = document.createElement("canvas");
let barcodeDisplay = document.getElementById("barcode-display");
let VIDEO_WIDTH = 320;
let VIDEO_HEIGHT = 240;
var timeout = null;

function toggleVideo() {
  if (!streaming) {
    const constraints = {
      video: {
        // the browser will try to honor this resolution, but it may end up being lower.
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT
      }
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
        videoInput.srcObject = stream;

        onVideoStarted();
      })
      .catch(function (err) {
        console.log(err);
      });
  } else {
    tracks = videoInput.srcObject.getTracks();
    tracks.forEach(element => { element.stop() });
    videoInput.srcObject = null;
    onVideoStopped();
  }
}

function onVideoStarted() {
  streaming = true;
  startAndStop.innerText = 'Stop';

  const track = videoInput.srcObject.getVideoTracks()[0];
  const actualSettings = track.getSettings();

  console.log(actualSettings.width, actualSettings.height)
  videoInput.width = actualSettings.width;
  videoInput.height = actualSettings.height;
  scan(videoInput.srcObject);
}

function onVideoStopped() {
  streaming = false;
  startAndStop.innerText = 'Start';
  stop_scan();
}

function scan() {

  // Draw image onto canvas
  canvas.width = videoInput.width;
  canvas.height = videoInput.height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(videoInput, 0, 0, videoInput.width, videoInput.height);

  // get the image data from the canvas
  const image = ctx.getImageData(0, 0, videoInput.width, videoInput.height)

  var code = zbarProcessImageData(image);

  console.log(code);
  barcodeDisplay.innerHTML = code;
  timeout = setTimeout(scan, 250);
}

function stop_scan() {
  clearTimeout(timeout);
}

startAndStop.addEventListener('click', () => toggleVideo());
