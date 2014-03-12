/*
 *  The Mason
 *  Responsible for reprenting and managing state of Tetris-like game
 *
 *  Some notes on terminology used
 *
 *  - The `wall` is the 2d array of binary collision data
 *  - A `block` is a 1x1 grid unit on the wall
 *  - A `filled` block is a block on the wall that has collision
 *  - An `empty` block is any non-filled block.  Empty is the default state
 *  - A `brick` is a floating set of blocks on the wall grid, but not attached
 *  - When the `tick` method is called, the active brick is moved down.
 *    If the brick cannot move down due to collision, all blocks in the wall
 *    directly under a block in the brick are filled, then the brick is removed
 *  - `Translating` refers to moving a block relative to its current position
 *  - `Collapsing` refers to moving blocks down and removing empty blocks
 *  - When a block is `deleted`, all blocks above it are translated down
 *  - When a block is `imploded`, all blocks above it are collapsed
 *  - When a row in the wall is completely filled, each block in it is deleted
 */

function Mason (width, height) {
    this.width = width
    this.height = height
    this.brickQueue = []
    this.brick = null
    this.rows = null
    this.brickOrientation = null
    this.reset()
}

Mason.prototype.reset = function () {
    this.rows = get2DBinaryArray(this.width, this.height)
    this.brick = null
    this.brickOrientation = 0
}

Mason.prototype.tick = function () {
    if (this._hasValidBrick())
        this.dropBrick(1)
    else
        this.dequeueBrick()

    return this
}

Mason.prototype.slideBrickRight = function (n) {
    return this.translateBrick(n, 0)
}

Mason.prototype.slideBrickLeft = function (n) {
    return this.translateBrick(-n, 0)
}

Mason.prototype.dropBrick = function (n) {
    // if it doesn't move, apply it to the wall
    if (!this._hasValidBrick())
        return this
    var y = this.brick.y
    this._translateBrick(0, n)
    if (this.brick.y === y)
        this.layBrick()
    return this
}

Mason.prototype.rotateBrick = function (n) {
    if (!this._hasValidBrick())
        return this
    var rotated = this.brick.getRotated(n)
    if (this._checkValidShapePosition(rotated, this.brick.x, this.brick.y)) {
        this.brick.blocks = rotated
        this.brick.setBlockOrientation(rotated, this.brick.orientation + n)
    }
    return this
}

Mason.prototype.queueNextBrick = function (brick) {
    this.brickQueue.push(brick)
    return this
}

Mason.prototype.dequeueBrick = function () {
    if (!this.brickQueue.length)
        return this

    this.brick = this.brickQueue.shift()
    if (!this._checkValidShapePosition(this.brick.blocks, this.brick.x, this.brick.y))
        this.reset()

    return this
}

Mason.prototype.layBrick = function () {
    if (!this._hasValidBrick())
        return this

    var y = this.brick.y
    var h = this.brick.blocks.length
    this._applyShape(this.brick.blocks, this.brick.x, this.brick.y)
    var i = 0
    while (i < h) {
        if (!this._checkRowHasEmpty(y+i))
            this.deleteRow(y+i)
        i++
    }
    this.brick = null
    return this
}

Mason.prototype.translateBrick = function (x, y) {
    if (!this._hasValidBrick())
        return this
    x |= 0
    y |= 0

    while (x | y) {
        this._translateBrick((!x ? 0 : x > 0 ? (x--, 1) : (x++, -1)),
                             (!y ? 0 : y > 0 ? (y--, 1) : (y++, -1)))
    }

    return this
}

Mason.prototype._translateBrick = function (x, y) {
    // x = +!!x * (x < 0 ? -1 : 1) yeah readability i guess
    var shape = this.brick.blocks
    x = this.brick.x + (x > 0 ? 1 : x < 0 ? -1 : 0)
    y = this.brick.y + (y > 0 ? 1 : y < 0 ? -1 : 0)

    if (this._checkValidShapePosition(shape, x, y))
      this.brick.move(x, y)

    return this
}

Mason.prototype._checkShapeInBounds = function (shape, x, y) {
    return !(x < 0 || x + shape[0].length > this.width
            || y < 0 || y + shape.length > this.height)
}

Mason.prototype._checkValidShapePosition = function (shape, x, y) {
    if (!this._checkShapeInBounds(shape, x, y))
      return false

    var sW = shape[0].length
    var sX, sY
    sY = shape.length
    while (sX = sW, sY--) {
      while (sX--) {
        if (shape[sY][sX] && this._checkIsFilled(x + sX, y + sY))
          return false
      }
    }

    return true
}

Mason.prototype._applyShape = function (shape, x, y) {
    if (!this._checkShapeInBounds(shape, x, y))
        return this

    var sW = shape[0].length
    var sX, sY
    sY = shape.length
    while (sX = sW, sY--) {
      while (sX--) {
        if (shape[sY][sX])
          this.fillBlock(x + sX, y + sY)
      }
    }

    return this
}

Mason.prototype._hasValidBrick = function () {
    var brick = this.brick
    return this.brick instanceof Brick && is2DArray(brick.blocks)
}

Mason.prototype._checkIsColumn = function (x) {
    return x > -1 && x < this.rows[0].length
}

Mason.prototype._checkIsRow = function (y) {
    return y > -1 && y < this.rows.length
}

Mason.prototype._checkInBounds = function (x, y) {
    return this._checkIsRow(y) && this._checkIsColumn(x)
}

Mason.prototype._get = function (x, y) {
    return this.rows[y][x]
}

Mason.prototype._set = function (x, y, v) {
    if (this._checkInBounds(x, y))
      this.rows[y][x] = v
    return this
}

Mason.prototype._checkRowHasEmpty = function (y) {
    if (!this._checkIsRow(y))
        return false
    return this.rows[y].some(returnFalsey)
}

Mason.prototype._checkIsFilled = function (x, y) {
    return this._checkInBounds(x, y) && this._get(x, y)
}

Mason.prototype._checkIsEmpty = function (x, y) {
    return this._checkInBounds(x, y) && !this._get(x, y)
}

Mason.prototype.fillBlock = function (x, y) {
    return this._set(x, y, 1)
}

Mason.prototype.clearBlock = function (x, y) {
    return this._set(x, y, 0)
}

Mason.prototype.translateBlock = function (x, y, oX, oY) {
    oX += x
    oY += y
    if (this._get(oX, oY))
        return this
    this._set(oX, oY, this._get(x, y))
    this._set(x, y, 0)
}

Mason.prototype.dropBlocksAbove = function (x, y) {
    while (y--)
      this.translateBlock(x, y, 0, 1)
    return this
}

Mason.prototype.collapseBlocksAbove = function (x, y) {
    var drop = 1
    while (y--) {
        if (this._checkIsFilled(x, y))
          this.translateBlock(x, y, 0, drop)
        else
          drop += 1
    }
    return this
}

Mason.prototype.deleteSpace = function (x, y) {
    return this.clearBlock(x, y).dropBlocksAbove(x, y)
}

Mason.prototype.implodeSpace = function (x, y) {
    return this.clearBlock(x, y).collapseBlocksAbove(x, y)
}

Mason.prototype.deleteRow = function (y) {
    if (!this._checkIsRow(y))
        return this

    var x = this.rows[y].length
    while (x--)
        this.deleteSpace(x, y)
    return this
}

Mason.prototype.collapseRow = function (y) {
    if (!this._checkIsRow(y))
        return this

    var x = this.rows[y].length
    while (x--)
        this.collapseSpace(x, y)
    return this
}

// Brick class

function Brick (template, x, y, r) {
    if (!is2DArray(template))
        throw "Invalid template, expecting integer 2D array"

    this.template = template
    this.orientation = r || 0
    this.x = x
    this.y = y
    this.blocks = this.getRotated(0)
}

Brick.prototype.getWidth = function () {
    return this.template[0].length
}

Brick.prototype.getHeight = function () {
    return this.template.length
}

Brick.prototype.move = function (x, y) {
    this.x = x
    this.y = y
    return this
}

Brick.prototype.setBlockOrientation = function (blocks, o) {
    this.blocks = blocks
    this.orientation = trueMod(o, 4)
}

Brick.prototype.getRotated = function (o) {
    /* transforms
    0 x, y            0, 0, 0, 0
    1 h-1-y, x        1, 1, 0, 1
    2 w-1-x, h-1-y    2, 0, 1, 1
    3 y, w-1-x        3, 1, 1, 0

    flip  = o & 1                   // 1 or 3
    flipY = (o & 2) >> 1 ^ (o & 1)  // 1 or 2
    flipX = o & 2                   // 2 or 3
    */

    o = trueMod((this.orientation + o), 4)
    var flip = o & 1
    var width = this.getWidth()
    var height = this.getHeight()
    var dWidth = flip ? height : width
    var dHeight = flip ? width : height
    var flipX = (o & 2) ? width - 1 : 0
    var flipY = ((o & 2) >> 1 ^ (o & 1)) ? height - 1 : 0

    var blocks = get2DBinaryArray(dWidth, dHeight)

    var x, y, dX, dY
    y = height
    while(x = width, y--) {
      while(x--) {
        dX = flipX ? flipX - x : x
        dY = flipY ? flipY - y : y
        if (flip) {
          dX = dX ^ dY
          dY = dX ^ dY
          dX = dX ^ dY
        }
        blocks[dY][dX] = this.template[y][x]
      }
    }

    return blocks
}


// helpers

function toBinary (str) {
    return parseInt(str, 2)
}

function reduceToBitmask (prev, val, i, arr) {
    return prev | ((val & 1) << i)
}

function get2DBinaryArray (width, height) {
    var res = []
    while (height--)
        res.push(Array(width+1).join('0').split('').map(toBinary))
    return res
}

function is2DArray (a) {
    return Array.isArray(a) && a.length && Array.isArray(a[0]) && a[0].length
}

function trueMod (n, base) {
    return (n % base + base) % base
}

function returnFalsey (val) {
    return !val
}
