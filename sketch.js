// CR mrussell: add a restart button
let initial_boxes = [1n,1n,1n,1n,1n,1n]
let boxes = [...initial_boxes]
let op1_corners = []
let op2_corners = []
let op1_inputs = []
let box_width = 100;
let padding = 150;
let spacing;
let total_input;
let path = [];
// 1O1_3 O2_2 0O1_3 1O1_1 O2_2 0O1_3 O2_2 1O1_0 O2_1 1O1_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 O2_1 1O1_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2 0O1_3 O2_2
let path_input;
let y_start = 150;

function reset() {
  boxes = [...initial_boxes]
  path = [];
  path_input.value('')
}

function parseNumTimes(n, i) {
  if (n < 0n) {
    return boxes[i] - n
  } else {
    return n
  }
}

function parseIntNoNan(s) {
  let i = parseInt(s);
  if (isNaN(i)) {
    throw("nan")
  } else {
    return i
  }
}
  
function parse_path_string_exn(s) {
  return s.split(' ')
    .filter(x => x.length > 0)
    .map(s => s.split("O").map(s => s.split("_")))
    .map(([ns, os]) => {
      let n = BigInt(ns[0].length == 0 ? 1 : parseIntNoNan(ns[0]));
      let [o, i] = os;
      o = parseIntNoNan(o);
      i = parseIntNoNan(i);
      if (o < 1 || o > 2) throw("o must be either 1 or 2");
      if (o == 2 && n !== 1n) throw("n must be 1 when o is 2: ${n}");
      if (i < 0 || i >= boxes.length) throw(`i must be between 0 and ${boxes.length}: ${i}`)
      return [n, o, i]
    })
}

function applyPath(new_path) {
  for (let [n_, o, i] of new_path) {
    if (o == 1) {
      let n = parseNumTimes(n_, i)
      if (boxes[i] < n) throw(`not enough in box ${i}: ${boxes[i]} < ${n}`)
      o1(n, i)
    } else if (o == 2) {
      if (boxes[i] < 1n) throw(`not enough in box ${i}: ${boxes[i]} < 1`)
      o2(i)
    } else {
      throw(`o must be either 1 or 2: ${o}`)
    }
  }
}

function setup() {
  createCanvas(1100, 400);
  rectMode(CENTER);
  spacing = (width - 2 * padding) / (boxes.length - 1);
  for (i = 0; i < boxes.length; i++) {
    let x = padding + i * spacing;
    let y = y_start;
    // the two operation on each box
    if (i < boxes.length - 1) {
      stroke(0, 0, 255); // blue
      x -= box_width / 4;
      y += box_width * 3/4;
      let w = box_width / 3;
      rect(x, y, w, w);
      op1_corners[i] = [x, y, w];
      let input = createInput('1');
      input.position(x - w / 4, y + w);
      input.size(w);
      op1_inputs[i] = input;
    }
    if (i < boxes.length - 2) {
      stroke(0, 255, 0); // green
      x += box_width / 2;
      let w = box_width / 3;
      rect(x, y, w, w);
      op2_corners[i] = [x, y, w];
    }
  }

  // reset button
  let button = createButton('restart');
  button.position(20, 20);
  button.mousePressed(reset);
  
  stroke(0)
  // draw total
  let y = y_start - box_width;
  let x = padding - box_width / 2;
  textAlign(RIGHT);
  textSize(15);
  total_input = createInput('');
  total_input.position(x, y);
  total_input.size(200);
  text("Total:    ", x, y);
  
  // make 'your path'
  x = 100;
  y = height - 100;
  path_input = createElement('textarea');;
  path_input.position(x, y);
  path_input.size(width - x - 100, 90);
  path_input.input(evt => {
    let saved_path = [...path];
    let saved_boxes = [...boxes];
    try {
      let new_path = parse_path_string_exn(evt.target.value);
      console.log("new path");
      console.log(new_path);
      reset();
      applyPath(new_path);
    } catch(err) {
      console.log(`failed to parse new path: ${err}`)
      path = saved_path;
      boxes = saved_boxes;
    }
  });
  textAlign(RIGHT);
  textSize(15);
  text("Your Path:    ", x, y);
}

function draw() {
  let y = y_start;
  for (i = 0; i < boxes.length; i++) {
    let x = padding + i * spacing;
    stroke(0);
    rect(x, y, box_width, box_width);
    textSize(40);
    textAlign(CENTER, CENTER);
    text(boxes[i].toString(), x, y);
  }

  let total = boxes.reduce((a, b) => a + b, 0n);
  total_input.value(`${total}`)
}

function inBox(box, point) {
  let [x,y] = point;
  let [bx, by, bw] = box;
  return Math.abs(x - bx) < bw / 2 && Math.abs(y - by) < bw / 2;
}

function swap_boxes(i, j) {
  let tmp = boxes[i];
  boxes[i] = boxes[j];
  boxes[j] = tmp;
}

function append_to_path(s) {
  path.push(s);
  path_input.value(path.join(' '));
}

function o1(num_times, i) {
  append_to_path(`${num_times}O1_${i}`);
  path_input.value(path.join(' '));
  let n = num_times == 0n ? boxes[i] : num_times;
  boxes[i] -= n;
  boxes[i+1] += 2n * n;
  op1_inputs[i].value('1');
}

function o2(i) {
  append_to_path(`O2_${i}`);
  boxes[i] -= 1n;
  swap_boxes(i+1, i+2);
}

function mouseClicked() {
  let point = [mouseX, mouseY];
  // detect if an operation was clicked
  for (i = 0; i < op1_corners.length; i++ ) {
    if (inBox(op1_corners[i], point)) {
      let input = op1_inputs[i];
      let num_times = parseInt(input.value()); 
      if (!isNaN(num_times)) {
        num_times = parseNumTimes(BigInt(num_times), i)
      } else {
        input.value('1')
      }
      if (boxes[i] > 0 && boxes[i] >= num_times) {
        o1(num_times, i)
      }
    }
  }
  for (i = 0; i < op2_corners.length; i++ ) {
    if (inBox(op2_corners[i], point)) {
      if (boxes[i] > 0) { o2(i) }
    }
  }
}
