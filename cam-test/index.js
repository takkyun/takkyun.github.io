const targets = ['environment','user']
const video  = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let targetIndex = 0;
let imageData;
let isReady = false;

function startMedia(index) {
  if (window.stream) {
    window.stream.getTracks().forEach(function (track) {
      track.stop();
    });
  }
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: { facingMode: { exact: targets[index] } }
    })
    .then(successCallback)
    .catch(errorCallback);
}

function successCallback(stream) {
  video.srcObject = stream;
  requestAnimationFrame(draw);
};

function errorCallback(err) {
  if (targetIndex < targets.length - 1) {
    setTimeout(() => {
      targetIndex += 1;
      startMedia(targetIndex);
    }, 100);
  } else {
    alert(err);
  }
};

function getLargestContour(contours) {
  let max_area = 0;
  let max_area_contour = new cv.Mat();
  for (let i = 0; i < contours.size(); ++i) {
    const cnt = contours.get(i);
    const area = cv.contourArea(cnt, false);
    if (max_area < area) {
      max_area = area;
      max_area_contour = cnt;
    }
  }
  return max_area_contour;
}

function draw() {
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
  ctx.drawImage(video, 0, 0);
  imageData = ctx.getImageData(0, 0, cw, ch);

  if (isReady) {
    const cv_src = new cv.matFromImageData(imageData);
    const processed = new cv.Mat();
    cv.cvtColor(cv_src, cv_src, cv.COLOR_RGB2GRAY, 0)
    // TODO: 
    cv.Canny(cv_src, processed, 50, 100, 3, false);
    cv.imshow('canvasOutput', processed);
    cv_src.delete();
    processed.delete();
  }

  ctx.putImageData(imageData, 0, 0);    
  requestAnimationFrame(draw);
}

function onOpenCvReady() {
  document.getElementById('status').innerHTML = 'OpenCV is ready';
  isReady = true;
}

function onOpenCvError() {
  document.getElementById('status').innerHTML = 'Failed to load OpenCV';
  isReady = false;
}

(function() {
  startMedia(targetIndex);
  document.getElementById('status').innerHTML = 'Preparing...';
  const script = Object.assign(document.createElement(`script`), {
    async: true,
    src: 'https://docs.opencv.org/master/opencv.js',
  });
  script.addEventListener('load', onOpenCvReady);
  script.addEventListener('error', onOpenCvError);
  document.head.appendChild(script);  
})();
