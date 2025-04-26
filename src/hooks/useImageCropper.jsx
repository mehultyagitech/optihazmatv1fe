import { useState, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

export default function useImageCropper({ url, ...props }) {
  const [image] = useState(url);
  const [cropData, setCropData] = useState("#");
  const cropperRef = useRef(null);

  const getCroppedImage = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL());
      return cropperRef.current.cropper.getCroppedCanvas().toDataURL();
    }
    return null;
  };

  const cropper = (
    <Cropper
      style={{ height: 400, width: "100%" }}
      initialAspectRatio={4/3}
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
  };
}
