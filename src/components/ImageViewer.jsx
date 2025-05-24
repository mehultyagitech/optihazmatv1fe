import React, { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import RoomIcon from "@mui/icons-material/Room";
import axiosInstance from "../api/axiosInstance";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  PinsSelector,
  locationPointAddDrawerState,
} from "../utils/States/LocationDiagram";

const ImageViewer = ({ imageUrl }) => {
  const pins = useRecoilValue(PinsSelector);
  const drawerState = useSetRecoilState(locationPointAddDrawerState);
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });
  const [transformState, setTransformState] = useState({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });
  const imageRef = useRef(null);

  const handleImageClick = async (e) => {
    if (!imageRef.current || !imageUrl) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const { width, top, left, height } = rect;

    const xPercent = ((e.clientX - left) / width) * 100;
    const yPercent = ((e.clientY - top) / height) * 100;

    const pinData = {
      open: true,
      x: xPercent,
      y: yPercent,
      pinId: "",
    };

    drawerState(pinData);
  };

  const handlePinDelete = async (pin) => {
    const pinId = pin.id;
    if (window.confirm("Delete this pin?")) {
      const response = await axiosInstance.delete(`/pins/${pinId}`);
      if (response.ok)
        setPins((prev) => prev.filter((pin) => pin.id !== pinId));
    }
  };

  return (
    <div
      style={{
        position: "relative",
        margin: "20px",
        overflow: "hidden",
        border: "1px solid #ccc",
        width: "800px",
        height: "800px",
        maxWidth: "100%",
        maxHeight: "80vh",
      }}
    >
      <TransformWrapper
        initialScale={1}
        doubleClick={{ disabled: true }} // Disable double-click zoom
        minScale={0.1}
        maxScale={10}
        centerOnInit={true}
        limitToBounds={true}
        centerZoomedOut={true}
        onTransformed={(e) => setTransformState(e.state)}
      >
        {({ zoomIn, zoomOut }) => (
          <>
            <div
              style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}
            >
              <button onClick={() => zoomIn()} style={{ marginRight: 5 }}>
                +
              </button>
              <button onClick={() => zoomOut()}>-</button>
            </div>{" "}
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}
                onDoubleClick={handleImageClick}
              >
                {imageUrl && (
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Floor Plan"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "contain",
                    }}
                    onLoad={() => {
                      if (imageRef.current) {
                        setImageNaturalSize({
                          width: imageRef.current.naturalWidth,
                          height: imageRef.current.naturalHeight,
                        });
                      }
                    }}
                  />
                )}
                {pins.map((pin) => (
                  <div
                    key={pin.id}
                    style={{
                      position: "absolute",
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: `translate(-50%, -50%) scale(${1 / transformState.scale})`,
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      zIndex: 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      drawerState({
                        open: true,
                        x: pin.x,
                        y: pin.y,
                        pinId: pin.id,
                      });
                    }}
                  >
                    <RoomIcon
                      style={{
                        color: "#31e040",
                        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))",
                        transform: "translateY(-50%)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default ImageViewer;
