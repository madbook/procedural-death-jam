var board = []
var _shape = null
var _x, _y
var pX, pY
var _nextShape = null
var _score = 0
var _level = 0
var gameSpeed = 250

var pieces = [
  ['11',
   '11'],

  ['00000',
   '00000',
   '01111',
   '00000',
   '00000'],

  ['000',
   '011',
   '110'],

  ['000',
   '110',
   '011'],

  ['010',
   '111',
   '000'],

  ['100',
   '111',
   '000'],

  ['001',
   '111',
   '000']
].map(makePiece)

reset(board)
tick()

function makePiece (arr) {
  return arr.map(function (line) {
    return parseInt(line, 2)
  })
}

// STATE

function reset (board) {
  _nextShape = getNextPiece()
  _shape = null
  board.length = 0
  while (board.length < 22)
    board.push(0)
  pX = 0
  pY = 21
  _score = 0
  return board
}

function getNextPiece () {
  return pieces[Math.min(pieces.length-1, Math.random()*pieces.length|0)].slice()
}

function getNewPiece () {
  _shape = _nextShape
  _nextShape = getNextPiece()
  _x = 10 - _shape.length
  _x = Math.min(_x, Math.random() * _x | 0)
  _x = 5
  _y = 0
}

function tick () {
  if (_shape === null)
    getNewPiece()
  else if (checkCollision(_shape, _x, _y + 1))
    board = addToBoard(board, _shape, _x, _y)
  else
    _y += 1

  render()
  setTimeout(tick, gameSpeed)
}

/*
  rotate functions are a little unintuitive due to the fact that i'm
  storing rows as bits instead of nesting arrays.  my way is more
  efficient, but it be easier to write the functions if it were a
  2d array...
 */

function rotateClockwise (shape) {
  var n = shape.length - 1
  return shape.map(function (line, i, arr) {
    var r = 0 // res
    var c = n - i // column to pull from
    var j = shape.length // iterate through rows
    var m // bit shift to put value in its target column
    var v
    while (j--) {
      m = (c - j)
      v = (arr[j] & (1 << c))
      r |= (m < 0) ? v << -m : v >> m
    }
    return r
  })
}

function rotateCounterclockwise (shape) {
  var n = shape.length - 1
  return shape.map(function (line, i, arr) {
    var r = 0 // res
    var c = i // column to pull from
    var j = shape.length // iterate through rows
    var m // amount to move column
    var v
    while (j--) {
      m = (j - (n -c))
      v = (arr[j] & (1 << c))
      r |= (m < 0) ? v << -m : v >> m
    }
    return r
  })
}

function checkCollision (shape, x, y) {
  var n = shape.length
  var m = 10 - n
  return shape.some(function (line, i) {
    if (line === 0) // if this line of shape is empty
      return false

    var _y = i + y
    if (_y >= board.length) // if line on board is below lowest
      return true

    var _x = m - x // map x coordinate to x bit (x=0 is 10th bit)

    if (_x < 0) { // piece is off the right side
      if (getMaskOfLength(-_x) & line)
        return true
      line >>= -_x
      _x = 0
    }
    else if (_x > m) { // piece is off the left side
      if (getMaskOfLength(_x - m) & (line >> (n - (_x - m))))
        return true
    }

    return !!(board[_y] & (line << _x))
  })
}

function checkCollisionAt (x, y) {
  if (x < 0 || x > 9 || y < 0 || y >= board.length)
    return false
  return !!(board[y] & (1 << (9 - x)))
}

function getMaskOfLength (l) {
  return parseInt(((~0 >>> 0).toString(2).slice(0,l)), 2)
}

function makeComposite (board, shape, x, y) {
  var n = shape.length
  var m = 10 - n
  shape.forEach(function (line, i) {
    if (line === 0 || i + y >= board.length)
      return

    var _x = m - x

    if (_x < 0) {
      line >>= -_x
      _x = 0
    }

    board[i + y] |= (line << _x)
  })
}

function addToBoard (board, shape, x, y) {
  _shape = null
  makeComposite(board, shape, x, y)

  var playerDies = false
  var points = 0

  var fullRow = (1 << 10) - 1
  board = board.filter(function (line, i) {
    if (line === fullRow) {
      points += 1
      if (i === pY)
        playerDies = true
      else if (pY < i)
        pY += 1
    }
    return !(line === fullRow)
  })

  if (playerDies) {
    console.log('player was on cleared row')
    board = reset(board)
    return board
  } else if (points) {
    increasePoints(points)
  }

  while (board.length < 22)
    board.unshift(0)

  if (board[2] !== 0) {
    console.log('board filled up!')
    board = reset(board)
  }

  return board
}

function increasePoints (n) {
  _score += n
}

// RENDERING

function render () {
  var composite = board.slice()

  composite = composite.map(renderer(10, '..', '##'))

  if (_shape)
    compositeShape(composite, '[]', _shape, _x, _y)

  composite[0] = '===================='
  composite[1] = composite[0]

  compositeSymbol(composite, "@'", pX, pY)

  view.innerHTML = composite.join('\n')
  preview.innerHTML = _nextShape.map(renderer(_nextShape.length, '[]', '  ')).join('\n')
  score.innerHTML = _score
}

function compositeShape (composite, s, shape, x, y) {
  var n = shape.length
  shape.forEach(function (line, i) {
    var j = n
    while (j--) {
      if (line & 1 << j)
        compositeSymbol(composite, s, x + (n - j - 1), y + i)
    }
  })
}

function compositeSymbol (composite, s, x, y) {
  if (y >= composite.length)
    return
  composite[y] = composite[y].slice(0, 2*x) + s + composite[y].slice(2*(x + 1))
}

function renderer (w, on, off) {
  return function (line) {
    return ((1 << w) | line).toString(2).slice(1).replace(/0/g, off).replace(/1/g, on)
  }
}



// INPUT

window.addEventListener('keydown', function (e) {
  if (!_shape)
    return
  var key = e.keyCode
  var shift = e.shiftKey

  if (shift) {
    if (key === 37 && checkCollisionAt(pX - 1, pY))
      pX -= 1
    if (key === 38 && checkCollisionAt(pX, pY - 1))
      pY -= 1
    if (key === 39 && checkCollisionAt(pX + 1, pY))
      pX += 1
    if (key === 40 && checkCollisionAt(pX, pY + 1))
      pY += 1
  }
  else {
    if (key === 37 && !checkCollision(_shape, _x - 1, _y))
      _x -= 1
    if (key === 39 && !checkCollision(_shape, _x + 1, _y))
      _x += 1
    if (key === 40 && !checkCollision(_shape, _x, _y + 1))
      _y += 1

    if (key === 88) {
      var _rotated = rotateClockwise(_shape)
      if (!checkCollision(_rotated, _x, _y))
        _shape = _rotated
    }
    if (key === 90) {
      var _rotated = rotateCounterclockwise(_shape)
      if (!checkCollision(_rotated, _x, _y))
        _shape = _rotated
    }
  }
  render()
})
