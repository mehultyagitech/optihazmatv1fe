import { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { dataUrlToFile } from "../utils/helpers";

export default function useImageCropper({ url, ...props }) {
  const [image, setImage] = useState(url);
  const [cropData, setCropData] = useState(null);
  const cropperRef = useRef(null);

  useEffect(() => {
    setImage(url);
  }, [url]);

  const getCroppedImage = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      if (canvas) {
        const dataURL = canvas.toDataURL();
        setCropData(dataUrlToFile(dataURL, crypto.randomUUID() + ".png"));
        setImage(dataURL);
        return dataURL;
      }
    }
    return null;
  };

  // 🌀 Rotation function
  const rotateLeft = () => {
    cropperRef.current?.cropper.rotate(-90);
  };

  const rotateRight = () => {
    cropperRef.current?.cropper.rotate(90);
  };

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
  }

  return {
    cropper,
    cropData,
    cropperRef,
    getCroppedImage,
    rotateLeft,
    rotateRight,
    resetCrop
  };
}
