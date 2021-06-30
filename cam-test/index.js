const medias = {
  audio: false,
  video: {
    facingMode: {
      exact: "environment"
    }
  }
};
const video  = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const promise = navigator.mediaDevices.getUserMedia(medias);

let imageData;
let isReady = false;

promise
  .then(successCallback)
  .catch(errorCallback);

function successCallback(stream) {
  video.srcObject = stream;
  requestAnimationFrame(draw);
};

function errorCallback(err) {
  alert(err);
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
    const imgray = new cv.Mat();
    cv.cvtColor(cv_src, cv_src, cv.COLOR_RGB2GRAY, 0)
    cv.Canny(cv_src, imgray, 50, 100, 3, false);
    // const thresh = new cv.Mat();
    // cv.threshold(imgray, thresh, 127, 255, 0)
    // let lines = new cv.Mat();
    // cv.HoughLinesP(thresh, lines, 1, Math.PI / 180, 2, 0, 0);
  
    // // draw lines
    // for (let i = 0; i < lines.rows; ++i) {
    //   let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
    //   let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
    //   cv.line(thresh, startPoint, endPoint, blue);
    //   startPoint.delete();
    //   endPoint.delete();
    // }
    
    // let contours = new cv.MatVector();
    // let largest_cnt = getLargestContour(contours);
    // let rect = cv.boundingRect(largest_cnt);
    // let rectangleColor = new cv.Scalar(255, 0, 230);
    // let point1 = new cv.Point(rect.x, rect.y);
    // let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
    // cv.rectangle(cv_src, point1, point2, rectangleColor, 5, cv.LINE_AA, 0);
    
    // let rotatedRect = cv.minAreaRect(largest_cnt);
    // let vertices = cv.RotatedRect.points(rotatedRect);
    // let red = new cv.Scalar( 255, 0,0);
    // for (let i = 0; i < 4; i++) {
    //   cv.line(cv_src, vertices[i], vertices[(i + 1) % 4], red, 2, cv.LINE_AA, 0);
    // }
    cv.imshow('canvasOutput', imgray);
    cv_src.delete();
    imgray.delete();
    // thresh.delete();
    // contours.delete();
    // lines.delete();
    // red.delete();
    // point1.delete();
    // point2.delete();
    // rectangleColor.delete();
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
  const script = Object.assign(document.createElement(`script`), {
    async: true,
    src: 'https://docs.opencv.org/master/opencv.js',
  });
  script.addEventListener('load', onOpenCvReady);
  script.addEventListener('error', onOpenCvError);
  document.head.appendChild(script);  
})();
