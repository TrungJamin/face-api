const imageUpload = document.getElementById("imageUpload");

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(start);

async function start() {
  const container = document.createElement("div");
  container.style.position = "relative";
  document.body.append(container);
  9;
  const labeledFaceDescriptors = await loadLabeledImages(); // 1 - 0.55 = 0.45
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6); // 0.5: độ không chính xác, 0.5: độ chính xác.
  let image;
  let canvas;
  document.body.append("Loaded");
  imageUpload.addEventListener("change", async () => {
    if (image) image.remove();
    if (canvas) canvas.remove();
    console.log("imageUpload: ", imageUpload);
    console.log("imageUpload.files[0]: ", imageUpload.files[0]);

    image = await faceapi.bufferToImage(imageUpload.files[0]); // image element with "src=base64"
    console.log("image: ", image);
    container.append(image);
    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    console.log("detections: ", detections);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) => {
      console.log("descriptor: ", d);
      console.log(
        " faceMatcher.findBestMatch(d.descriptor): ",
        faceMatcher.findBestMatch(d.descriptor)
      );
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);
    });
  });
}

function loadLabeledImages() {
  const labels = ["TruongThanhHuy, TruongVanNam"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 10; i++) {
        const img = await faceapi.fetchImage(
          `https://raw.githubusercontent.com/TrungJamin/face-api/master/labeled_images/${label}/${i}.jpg`
        );
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
