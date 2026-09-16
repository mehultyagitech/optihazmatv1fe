import React, { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import RoomIcon from "@mui/icons-material/Room";
import axiosInstance from "../api/axiosInstance";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  PinsSelector,
  locationPointAddDrawerState,
  selectedPinIdState,
} from "../utils/States/LocationDiagram";

const ImageViewer = ({ imageUrl }) => {
  const pins = useRecoilValue(PinsSelector);
  const drawerState = useSetRecoilState(locationPointAddDrawerState);
  const [selectedPinId, setSelectedPinId] = useRecoilState(selectedPinIdState);
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
        border: "1px solid #cfd8dc",
        borderRadius: 8,
        background: "#fff",
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
            {/* Zoom controls (look only; the viewer box and point maths are unchanged) */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
                overflow: "hidden",
              }}
            >
              {[
                ["+", "Zoom in", () => zoomIn()],
                ["−", "Zoom out", () => zoomOut()],
              ].map(([label, title, onClick], i) => (
                <button
                  key={title}
                  type="button"
                  title={title}
                  aria-label={title}
                  onClick={onClick}
                  style={{
                    width: 34,
                    height: 34,
                    border: 0,
                    borderTop: i ? "1px solid #e2e8f0" : 0,
                    background: "#fff",
                    color: "#0d47a1",
                    fontSize: 20,
                    fontWeight: 700,
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
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
                      // Select it: the side panel shows its details and
                      // "Open Details" opens it for editing.
                      setSelectedPinId(pin.id);
                    }}
                    onDoubleClick={(e) => {
                      // Shortcut to edit; also keeps the double-click from
                      // reaching the image, which would add a new point.
                      e.stopPropagation();
                      drawerState({ open: true, x: pin.x, y: pin.y, pinId: pin.id });
                    }}
                  >
                    <RoomIcon
                      style={{
                        color: pin.id === selectedPinId ? "#e53935" : "#31e040",
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
