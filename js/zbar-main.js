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

const constraints = {
    video: {
        // the browser will try to honor this resolution, but it may end up being lower.
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT
    }
};

function toggleVideo() {
    if (!streaming) { // Start video stream and scan
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                videoInput.srcObject = stream;
                onVideoStarted();
            })
            .catch(function(err) {
                console.log(err);
            });
    } else { // Stop video stream and stop scanning
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
    scan(2); // Scan at 2 frames per second
}

function onVideoStopped() {
    streaming = false;
    startAndStop.innerText = 'Start';
    stop_scan();
}

function scan(fps) {

    // Draw image onto canvas
    canvas.width = videoInput.width;
    canvas.height = videoInput.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(videoInput, 0, 0, videoInput.width, videoInput.height);

    // get the image data from the canvas
    const image = ctx.getImageData(0, 0, videoInput.width, videoInput.height)

    // Identify all barcodes in image
    var barcode_list = zbarProcessImageData(image);

    // TODO do whatever with the barcodes
    console.log(barcode_list);
    barcodeDisplay.innerHTML = barcode_list;

    console.log(1000 / fps);
    timeout = setTimeout(function() { scan(fps) }, 1000 / fps); // Scanning rate

    return barcode_list;
}

function stop_scan() {
    clearTimeout(timeout);
}

startAndStop.addEventListener('click', () => toggleVideo());