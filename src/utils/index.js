const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// REF: https://stackoverflow.com/a/17777674/4240137
const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  var lines = text.split("\n");

  for (var i = 0; i < lines.length; i++) {
      var words = lines[i].split(' ');
      var line = '';

      for (var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
              line = words[n] + ' ';
              y += lineHeight;
          }
          else {
              line = testLine;
          }
      }

      ctx.fillText(line, x, y);
      y += lineHeight;
  }
}

module.exports = {
  capitalize,
  wrapText,
}
