import * as faceapi from "face-api.js";

const MODEL_URL = "/models";
let modelPromise;

export const loadFaceApiModels = () => {
  if (!modelPromise) {
    modelPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
  }
  return modelPromise;
};

export const detectorOptions = () =>
  new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5
  });

export const getSingleFaceDescriptor = async (input) => {
  await loadFaceApiModels();
  const detections = await faceapi
    .detectAllFaces(input, detectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections.length) {
    return { error: "NO_FACE" };
  }

  if (detections.length > 1) {
    return { error: "MULTIPLE_FACES", count: detections.length };
  }

  return {
    descriptor: Array.from(detections[0].descriptor),
    detection: detections[0].detection
  };
};

const calculateFaceMatchConfidence = (distance, threshold) => {
  if (!Number.isFinite(distance) || !Number.isFinite(threshold) || threshold <= 0) return 0;

  const normalizedMatch = Math.max(0, Math.min(1, 1 - distance / threshold));
  return Math.round(70 + normalizedMatch * 29);
};

export const findBestFaceMatch = (descriptor, students, threshold = 0.52, minDistanceGap = 0.04) => {
  const candidates = students
    .filter((student) => Array.isArray(student.faceDescriptor) && student.faceDescriptor.length >= 128)
    .map((student) => {
      const distance = faceapi.euclideanDistance(
        new Float32Array(descriptor),
        new Float32Array(student.faceDescriptor)
      );
      return { student, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  const best = candidates[0];
  const secondBest = candidates[1];
  if (!best || best.distance > threshold) {
    return { matched: false, best, secondBest, threshold };
  }

  if (secondBest && secondBest.distance - best.distance < minDistanceGap) {
    return {
      matched: false,
      best,
      secondBest,
      threshold,
      ambiguous: true,
      minDistanceGap
    };
  }

  return {
    matched: true,
    student: best.student,
    distance: best.distance,
    confidence: calculateFaceMatchConfidence(best.distance, threshold),
    threshold,
    secondBest
  };
};
