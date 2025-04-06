import React, { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import RoomIcon from '@mui/icons-material/Room';
import axiosInstance from "../api/axiosInstance";

const ImageViewer = ({ attachmentId, imageUrl }) => {
  const [pins, setPins] = useState([]);
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

  const fetchPins = async () => {
    const response = await axiosInstance.get(
      `/attachments/${attachmentId}/pins`
    );
    setPins(response.data.data);
  };

  useEffect(() => {
    if (!!attachmentId) {
      fetchPins();
    }
  }, [attachmentId]);

  const handleImageClick = async (e) => {
    if (!imageRef.current || !imageUrl) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const { width, top, left, height } = rect;

    const xPercent = ((e.clientX - left) / width) * 100;
    const yPercent = ((e.clientY - top) / height) * 100;

    const note = prompt("Enter note for this pin:");
    if (note) {
      const newPin = {
        x: xPercent,
        y: yPercent,
        label: note,
        attachmentId: attachmentId,
      };

      const response = await axiosInstance.post("/pins", newPin, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const createdPin = await response.json();
        setPins((prev) => [...prev, createdPin]);
      }
    }
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
        height: "600px",
        maxWidth: "100%",
        maxHeight: "80vh",
      }}
    >
      <TransformWrapper
        initialScale={1}
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
            </div>
            <TransformComponent>
              <div
                style={{
                  width: `${imageNaturalSize.width}px`,
                  height: `${imageNaturalSize.height}px`,
                  position: "relative",
                }}
                onDoubleClick={handleImageClick}
              >
                {imageUrl && (
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Floor Plan"
                    style={{ width: "100%", height: "100%", display: "block" }}
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
                      handlePinDelete(pin);
                    }}
                  >
                    <div 
                      title={pin.label} 
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'scale(1.5)',
                        position: 'relative'
                      }}
                    >
                      <RoomIcon 
                        style={{ 
                          color: '#31e040', 
                          filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))',
                          transform: 'translateY(-50%)'
                        }} 
                      />
                    </div>
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
