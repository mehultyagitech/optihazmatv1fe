import { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { dataUrlToFile } from "../utils/helpers";

export default function useImageCropper({ url, ...props }) {
  const [image, setImage] = useState(url);
  const [cropData, setCropData] = useState(null);
  const [rotationPending, setRotationPending] = useState(false);
  const cropperRef = useRef(null);

  useEffect(() => {
    setImage(url);
    // A different source image carries no rotation of its own yet.
    setRotationPending(false);
  }, [url]);

  const getCroppedImage = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      if (canvas) {
        const dataURL = canvas.toDataURL();
        setCropData(dataUrlToFile(dataURL, crypto.randomUUID() + ".png"));
        setImage(dataURL);
        // The crop now holds whatever rotation is on screen.
        setRotationPending(false);
        return dataURL;
      }
    }
    return null;
  };

  // 🌀 Rotation function
  // Only the crop is uploaded, so a rotation reaches the saved image through
  // the next crop. Until then it is pending, and the page says so rather than
  // saving the picture the user no longer sees.
  const rotate = (degrees) => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.rotate(degrees);
    setRotationPending(true);
  };

  const rotateLeft = () => rotate(-90);

  const rotateRight = () => rotate(90);

  const cropper = (
    <Cropper
      style={{ height: '80vh', width: "100%" }}
      initialAspectRatio={1}
      preview=".img-preview-remote"
      src={image}
      ref={cropperRef}
      viewMode={!cropData ? 1 : 2}
      guides={false}
      background={false}
      responsive={true}
      checkOrientation={false}
      width={'100%'}
      {...props}
    />
  );

  const resetCrop = () => {
    cropperRef.current?.cropper.destroy();  
    cropperRef.current = null;
    setImage('#'); 
    setCropData(null);
    setRotationPending(false);
  }

  return {
    cropper,
    cropData,
    cropperRef,
    getCroppedImage,
    rotateLeft,
    rotateRight,
    rotationPending,
    resetCrop
  };
}
