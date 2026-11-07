import React, { useRef, useState, useEffect } from "react";

export const BoundingBoxOverlay = ({
  imageSrc,
  detections = [],
  naturalWidth: propNatWidth = 0,
  naturalHeight: propNatHeight = 0,
  className = "",
}) => {
  const imgRef = useRef(null);
  const [displayedSize, setDisplayedSize] = useState({
    width: 0,
    height: 0,
  });
  const [naturalSize, setNaturalSize] = useState({
    width: propNatWidth || 0,
    height: propNatHeight || 0,
  });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const updateDimensions = () => {
    if (imgRef.current) {
      setDisplayedSize({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
      if (!propNatWidth && imgRef.current.naturalWidth) {
        setNaturalSize({
          width: imgRef.current.naturalWidth,
          height: imgRef.current.naturalHeight,
        });
      }
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const scaleX = naturalSize.width > 0 ? displayedSize.width / naturalSize.width : 1;
  const scaleY = naturalSize.height > 0 ? displayedSize.height / naturalSize.height : 1;

  return (
    <div className={`relative inline-block overflow-hidden rounded-xl border border-slate-800 ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Circuit Schematic"
        onLoad={updateDimensions}
        className="block max-h-[70vh] w-auto max-w-full object-contain"
      />

      {displayedSize.width > 0 &&
        detections.map((det, idx) => {
          if (!det.bbox_xyxy || det.bbox_xyxy.length !== 4) return null;
          const [x1, y1, x2, y2] = det.bbox_xyxy;

          const left = x1 * scaleX;
          const top = y1 * scaleY;
          const width = (x2 - x1) * scaleX;
          const height = (y2 - y1) * scaleY;

          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
              className={`absolute border-2 transition-all cursor-pointer pointer-events-auto ${
                isHovered
                  ? "border-cyan-400 bg-cyan-400/25 z-20 shadow-lg"
                  : "border-emerald-400/80 bg-emerald-400/10 z-10 hover:border-cyan-400"
              }`}
            >
              <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/90 text-cyan-300 border border-cyan-500/40 whitespace-nowrap shadow-md pointer-events-none">
                {det.class_name} ({Math.round(det.confidence * 100)}%)
              </div>
            </div>
          );
        })}
    </div>
  );
};
