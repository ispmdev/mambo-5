// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker Registered'))
    .catch(err => console.log('Service Worker Registration Failed:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const resultDiv = document.getElementById('barcode-result');

  // Initialize QuaggaJS
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: video, // Or '#yourElement' (optional)
      constraints: {
        facingMode: "environment" // or user for front camera
      }
    },
    decoder: {
      readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader", "code_39_reader"]
    },
  }, function(err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log("QuaggaJS initialized.");
    Quagga.start();
  });

  // Listen to detected barcodes
  Quagga.onDetected(data => {
    const code = data.codeResult.code;
    resultDiv.innerText = `Detected Barcode: ${code}`;
    
    // Optionally, stop scanning after a barcode is detected
    Quagga.stop();
  });

  // Handle errors
  Quagga.onProcessed(result => {
    if (result) {
      const drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

      if (result.boxes) {
        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
        result.boxes.filter(box => box !== result.box).forEach(box => {
          Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
        });
      }

      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
      }

      if (result.codeResult && result.codeResult.code) {
        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
      }
    }
  });
});