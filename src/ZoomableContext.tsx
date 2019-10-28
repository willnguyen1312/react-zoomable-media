import React from 'react';

export interface ZoomableContextType {
  id: string | undefined;
  height: number;
  width: number;
  currentZoom: number;
  lastPositionX: number;
  lastPositionY: number;
  positionX: number;
  positionY: number;
  isOnMove: boolean;
  startX: number;
  startY: number;
  percentage: number;
  enable: boolean;
  enableFocus: () => void;
  updatePercentage: (newCurrentZoom: number) => void;
  setWrapperDimensions: () => void;
  onMediaReady: (
    mediaRef: React.RefObject<HTMLImageElement | HTMLVideoElement>
  ) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  onWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  handlePointerUp: () => void;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
}

export const zoomableContext = React.createContext<ZoomableContextType | null>(
  null
);

export const ZoomableProvider = zoomableContext.Provider;
export const ZoomableConsumer = zoomableContext.Consumer;
