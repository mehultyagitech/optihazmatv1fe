import { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

export default function useImageCropper({ url, ...props }) {
  useEffect(() => {
    console.log("Image Cropper Hook triggered with URL:", url);
  }, [url]);

  const [image, setImage] = useState(url);

  useEffect(() => {
    setImage(url);
  }, [url]);

  const [cropData, setCropData] = useState("#");
  const cropperRef = useRef(null);

  const getCroppedImage = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      if (canvas) {
        const dataURL = canvas.toDataURL();
        setCropData(dataURL);
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
    console.log("ksdskjnjl")
     cropperRef.current?.cropper.rotate(90);
  };

  const cropper = (
    <Cropper
      style={{ height: 400, width: "100%" }}
      initialAspectRatio={1}
      preview=".img-preview-remote"
      src={image}
      ref={cropperRef}
      viewMode={1}
      guides={true}
      minCropBoxHeight={10}
      minCropBoxWidth={10}
      background={false}
      responsive={true}
      checkOrientation={false}
      {...props}
    />
  );

  return {
    cropper,
    cropData,
    cropperRef,
    getCroppedImage,
    rotateLeft,
    rotateRight
  };
}
