import { useState, type SyntheticEvent } from "react";
import { screenshotCrop, type ScreenshotCrop } from "./screenshot-crop";

type Crop = { bounds: ScreenshotCrop; width: number; height: number };
const crops = new Map<string, Crop>();

export function CroppedScreenshot({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [loaded, setLoaded] = useState<{ src: string; crop: Crop } | null>(
    null,
  );
  const [error, setError] = useState<{ src: string; message: string } | null>(
    null,
  );
  const crop = crops.get(src) ?? (loaded?.src === src ? loaded.crop : null);

  function onLoad(event: SyntheticEvent<HTMLImageElement>) {
    try {
      const image = event.currentTarget;
      if (image.naturalWidth <= 0 || image.naturalHeight <= 0)
        throw new Error("Screenshot has invalid dimensions");
      const scale = Math.min(
        1,
        1024 / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context)
        throw new Error("Screenshot cropping requires a canvas context");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const bounds = screenshotCrop({
        pixels: context.getImageData(0, 0, canvas.width, canvas.height),
        padding: 4,
      });
      const result = {
        width: image.naturalWidth,
        height: image.naturalHeight,
        bounds: {
          x: (bounds.x * image.naturalWidth) / canvas.width,
          y: (bounds.y * image.naturalHeight) / canvas.height,
          width: (bounds.width * image.naturalWidth) / canvas.width,
          height: (bounds.height * image.naturalHeight) / canvas.height,
        },
      };
      crops.set(src, result);
      setLoaded({ src, crop: result });
    } catch (cause) {
      setError({
        src,
        message: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }

  if (error?.src === src)
    return (
      <span role="alert" className="text-xs text-destructive">
        Screenshot preview failed: {error.message}. Open the full screenshot.
      </span>
    );
  if (!crop)
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={className}
        onLoad={onLoad}
        onError={() =>
          setError({ src, message: "Could not load the screenshot" })
        }
      />
    );
  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox={`${crop.bounds.x} ${crop.bounds.y} ${crop.bounds.width} ${crop.bounds.height}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <image href={src} width={crop.width} height={crop.height} />
    </svg>
  );
}
