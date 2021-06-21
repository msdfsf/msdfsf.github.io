var color;
var colorOdd = ["#1e2022", "#484848", "#AAAAAA"];
var colorEven = ["#1e2022", "#484848"];
var slices;
var step;
var deg;
var canvas;
var ctx;
var size;
var center;

var wasReloaded = true;
var animationIsRunning;

var result = {
  index: 0,
  name: "",
  choice: "" 
};
var array;

function drawSlice(deg, color){
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(center, center);
  ctx.arc(center, center, size/2, deg, deg + step);
  ctx.lineTo(center, center);
  ctx.fill();
}

function drawText(deg, text) {
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(deg);
  ctx.transform(-1, 0, 0, -1, 0, 0);
  ctx.translate(-220, 0);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = 'bold 20px sans-serif';
  if (text.length > 14) text = text.substring(0, 14);
  ctx.fillText(text, 0, 5);
  ctx.restore();
}

function drawWheel(array) {
  slices = array.length;
  step = 2*Math.PI/slices;
  halfStep = Math.PI/slices;
  deg = 0;

  if (slices % 2 === 0) color = colorEven;
  else color = colorOdd; 

  for(i = 0; i < slices; i++){
    drawSlice(deg, color[i % color.length]);
    drawText(deg + halfStep, array[i]);
    deg += step;
  }
}

// time - s, speed - rot/s
function spinWheel(time, speed) { 

  if (animationIsRunning) return;
  animationIsRunning = true;

  updateWheel();

  var rotCount = speed * time;
  if (rotCount < 0) rotCount = 0;
  var deg = rotCount * Math.PI * 2;
  var offset = Math.random() * Math.PI * 2;

  var finDeg = deg + offset;
  var slowdownFrames = (data.wheelSlowDownTime * data.hz);
  var frameCount = (time * data.hz);
  var step = finDeg / frameCount;
  frameCount +=  slowdownFrames;

  requestAnimationFrame(function() {rotateWheel(step, 0, frameCount, slowdownFrames, step, finDeg)});

}

function rotateWheel(step, curFrame, frameCount, slowdownFrames, savedStep, offset) {

  if (curFrame >= frameCount - slowdownFrames) { 
    if (curFrame > frameCount) {
      animationIsRunning = false;
      var d = new Date();
      validateResult(offset, savedStep);
      displayResult(result);
      decreaseSlots(result.name);
      // for unexpexted occasions
      console.log("[" + d.getHours() + ":" + d.getMinutes() + "] " + "Wheel Result: " + result.name + " " + result.choice);
      return; 
    }
    step -= savedStep/slowdownFrames; 
    offset += step;
  }

  ctx.clearRect(0, 0, size, size);
  ctx.translate(center, center);
  ctx.rotate(step);
  ctx.translate(-center, -center);

  drawWheel(array);

  // drawTriangle(size - 25, size - 25, 50 ,50, "#FFFFFF");

  // ctx.fillRect(0,0,500,500)

  // curDeg += step;
  curFrame += 1;
  requestAnimationFrame(function() {rotateWheel(step, curFrame, frameCount, slowdownFrames, savedStep, offset)});

}

// draws isosceles triangle
// x - x cord of top point, y - y cord of top point
// v - height, w - width
function drawTriangle(x, y, v, w, fillColor) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w / 2, y + v);
  ctx.lineTo(x - w / 2, y + v);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
}

function displayResult(result) {

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save();
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 5;
  ctx.filter = 'blur(100px)';
  ctx.fillStyle = 'white';
  ctx.fillRect(0,50,500,400);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = 'bold 40px sans-serif';
  ctx.shadowBlur = 1;
  ctx.filter = 'blur(0px)';
  ctx.fillStyle = 'black';

  if (ctx.measureText(result.name) > 500 || ctx.measureText(result.choice)) ctx.font = 'bold 20px sans-serif';

  ctx.fillText(result.name, center, center - 20);
  ctx.fillText(result.choice, center, center + 20);
  ctx.restore();

  // copying to the clipboard
  copyToClipboard(result.name + " " + result.choice);

}

function copyToClipboard(value) {

  var textArea = document.createElement("textarea");

  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = 0;
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';

  textArea.value = value;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try { document.execCommand('copy'); }
  catch (err) { console.log('Unable copy to clipboard...'); }

  document.body.removeChild(textArea);

}

function validateResult(offset) {

  offset = Math.abs(offset % (Math.PI * 2));
  var neededDeg = Math.PI / 2;
  var deltaDeg = neededDeg - offset;

  var index = Math.floor(deltaDeg / step);
  if (index < 0) index = array.length + index;
  if (index === array.length) index = 0;
  result.index = index;
  result.name = array[index];
  result.choice = orderChoices[orderNames.indexOf(array[index])];
}

function decreaseSlots(slot) {
  if (array.length === 1) return;
  const index = array.indexOf(slot);
  if (index > -1) {
    array.splice(index, 1);
  }
}

function updateWheel() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, size, size);
  drawWheel(array);
}

function createWindow(subMult, folMult) {

  subMult = Math.floor(subMult);
  folMult = Math.floor(folMult);

  var window = document.getElementById('wheelWindow');
  window.style.display = "inline-block";
  canvas = document.getElementById('wheel');
  ctx = canvas.getContext('2d');
  deg = 0;
  size  = canvas.width;
  center = size/2;
  if (wasReloaded) { 
    // array = [...orderNames];
    array = [];
    for (i = 0; i < subIndexes.length; i++) {
      for (j = 0; j < subMult; j++)
        array[i * subMult + j] = orderNames[subIndexes[i]];
    }
    for (i = 0; i < folIndexes.length; i++) 
      for (j = 0; j < folMult; j++)
        array[subIndexes.length * subMult + i * folMult + j] = orderNames[folIndexes[i]];
  }
  wasReloaded = false;
  drawWheel(array);
  dragElement();

}

function closeWindow() {
  var window = document.getElementById('wheelWindow');
  window.style.display = "none";
  var ctx = document.getElementById('wheel').getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// dragging

function dragElement() {
  elmnt = document.getElementById("wheelWindow");

  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById("wheelHeader")) document.getElementById("wheelHeader").onmousedown = dragMouseDown;
  else elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();

    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;

    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}