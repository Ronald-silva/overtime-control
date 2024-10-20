import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function FacialRecognition({ onRecognized }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isRecognizing, setIsRecognizing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const startRecognition = async () => {
    setIsRecognizing(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    videoRef.current.srcObject = stream;

    videoRef.current.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(videoRef.current);
      canvasRef.current.appendChild(canvas);
      const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        if (detections.length > 0) {
          setIsRecognizing(false);
          onRecognized(true);
          stream.getTracks().forEach(track => track.stop());
        }
      }, 100);
    });
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted width="320" height="240" />
      <div ref={canvasRef} />
      {!isRecognizing && <button onClick={startRecognition}>Iniciar Reconhecimento</button>}
    </div>
  );
}