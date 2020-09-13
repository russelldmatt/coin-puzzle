console.log('loaded sketch');

let initial_boxes = [1,1,1,1,1,1]
let boxes = [...initial_boxes]
let op1_corners = []
let op2_corners = []
let op1_inputs = []
let box_width = 70;
let padding = 100;
let spacing;
let total_input;
let path = [];
let path_input;
let y_start = 150;

let start_of_optimal_path = "1O1_3 0O1_4 1O1_2 O2_3 0O1_4 O2_3 1O1_1 O2_2 1O1_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 0O1_4 O2_3 O2_2 1O1_0 O2_1"

function reset() {
  boxes = [...initial_boxes]
  path = [];
  path_input.value('')
}

function undo() {
  let saved_path = [...path];
  saved_path.pop();
  reset();
  for (let s of saved_path) {
    let el = parse_path_element_exn(s);
    apply_path_element(el)
  }
}

function parseNumTimes(n, i) {
  if (n < 0) {
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

function parse_path_element_exn(s) {
  let [ns, os] = s.split("O").map(s => s.split("_"))
  let n = ns[0].length == 0 ? 1 : parseIntNoNan(ns[0]);
  let [o, i] = os;
  o = parseIntNoNan(o);
  i = parseIntNoNan(i);
  if (o < 1 || o > 2) throw("o must be either 1 or 2");
  if (o == 2 && n !== 1) throw("n must be 1 when o is 2: ${n}");
  if (i < 0 || i >= boxes.length) throw(`i must be between 0 and ${boxes.length}: ${i}`)
  return [n, o, i]  
}

function parse_path_string_exn(s) {
  return s.split(' ')
    .filter(x => x.length > 0)
    .map(parse_path_element_exn)
}

function append_to_path(s) {
  path.push(s);
  path_input.value(path.join(' '));
}

function swap_boxes(i, j) {
  let tmp = boxes[i];
  boxes[i] = boxes[j];
  boxes[j] = tmp;
}

function o1(num_times, i) {
  append_to_path(`${num_times}O1_${i}`);
  path_input.value(path.join(' '));
  let n = num_times == 0 ? boxes[i] : num_times;
  boxes[i] -= n;
  boxes[i+1] += 2 * n;
  op1_inputs[i].value('1');
}

function o2(i) {
  append_to_path(`O2_${i}`);
  boxes[i] -= 1;
  swap_boxes(i+1, i+2);
}

function apply_path_element(el) {
  let [n_, o, i] = el;
    if (o == 1) {
      let n = parseNumTimes(n_, i)
      if (boxes[i] < n) throw(`not enough in box ${i}: ${boxes[i]} < ${n}`)
      o1(n, i)
    } else if (o == 2) {
      if (boxes[i] < 1) throw(`not enough in box ${i}: ${boxes[i]} < 1`)
      o2(i)
    } else {
      throw(`o must be either 1 or 2: ${o}`)
    }
}
  
function applyPath(new_path) {
  for (let el of new_path) {
    apply_path_element(el)
  }
}

function show_solution() {
  reset();
  let new_path = parse_path_string_exn(start_of_optimal_path);
  applyPath(new_path);
}

function setup() {
  createCanvas(790, 400);
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
      let input = createInput('1', "tel");
      input.position(x - w/8, y + w); // confused - why does w/8 look right?
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
  let resetButton = createButton('restart');
  resetButton.position(20, 20);
  resetButton.mousePressed(reset);
  
  // undo button
  let undoButton = createButton('undo');
  undoButton.position(20 + resetButton.size().width + 10, 20);
  undoButton.mousePressed(undo);
  
  stroke(0)
  // draw total
  let y = y_start - box_width;
  let x = padding - box_width / 2;
  textAlign(LEFT, CENTER);
  textSize(15);
  let total_text = "Total: ";
  text("Total:    ", x, y);
  total_input = createInput('');
  total_input.position(x + textWidth(total_text) + 10, y);
  total_input.size(200);
  
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
    textSize(25);
    textAlign(CENTER, CENTER);
    text(boxes[i].toString(), x, y);
  }

  let total = boxes.reduce((a, b) => a + b, 0);
  total_input.value(`${total}`)
}

function inBox(box, point) {
  let [x,y] = point;
  let [bx, by, bw] = box;
  return Math.abs(x - bx) < bw / 2 && Math.abs(y - by) < bw / 2;
}

function mouseClicked() {
  let point = [mouseX, mouseY];
  // detect if an operation was clicked
  for (i = 0; i < op1_corners.length; i++ ) {
    if (inBox(op1_corners[i], point)) {
      let input = op1_inputs[i];
      let num_times = parseInt(input.value()); 
      if (!isNaN(num_times)) {
        num_times = parseNumTimes(num_times, i)
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
