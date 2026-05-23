var fs = require("fs");
var path = require("path");
var zlib = require("zlib");

var size = 128;
var root = path.resolve(__dirname, "..");
var pixels = Buffer.alloc(size * size * 4);

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) {
    return;
  }
  var offset = (y * size + x) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3];
}

function fill(color) {
  for (var y = 0; y < size; y += 1) {
    for (var x = 0; x < size; x += 1) {
      setPixel(x, y, color);
    }
  }
}

function rect(x0, y0, w, h, color) {
  for (var y = y0; y < y0 + h; y += 1) {
    for (var x = x0; x < x0 + w; x += 1) {
      setPixel(x, y, color);
    }
  }
}

function circle(cx, cy, radius, color) {
  var r2 = radius * radius;
  for (var y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (var x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      var dx = x - cx;
      var dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(x, y, color);
      }
    }
  }
}

function crc32(buffer) {
  var table = crc32.table;
  if (!table) {
    table = [];
    for (var n = 0; n < 256; n += 1) {
      var c = n;
      for (var k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    crc32.table = table;
  }
  var crc = 0xffffffff;
  for (var i = 0; i < buffer.length; i += 1) {
    crc = table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  var typeBuffer = Buffer.from(type);
  var length = Buffer.alloc(4);
  var crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function png() {
  var header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  var rows = Buffer.alloc((size * 4 + 1) * size);
  for (var y = 0; y < size; y += 1) {
    var rowStart = y * (size * 4 + 1);
    rows[rowStart] = 0;
    pixels.copy(rows, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

fill([0, 0, 0, 255]);
circle(64, 64, 50, [8, 24, 28, 255]);
circle(64, 64, 45, [20, 77, 82, 255]);
circle(64, 64, 30, [0, 0, 0, 255]);
rect(57, 22, 14, 70, [85, 255, 157, 255]);
rect(37, 82, 54, 13, [68, 215, 255, 255]);
circle(64, 40, 11, [255, 200, 87, 255]);
circle(64, 40, 5, [0, 0, 0, 255]);

fs.writeFileSync(path.join(root, "favicon.png"), png());
console.log("Wrote favicon.png");
