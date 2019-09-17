import React from 'react';
import { ZOOM_DIRECTION } from 'constant';

export interface ZoomableContextType {
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
  setPercentage: (newCurrentZoom: number) => void;
  onImageLoad: () => void;
  onVideoLoad: () => void;
  zoom: (direction: ZOOM_DIRECTION) => () => void;
  onWheel: (event: WheelEvent) => void;
  handleMouseUp: () => void;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  sliderRef: React.RefObject<HTMLDivElement>;
}

const zoomableContext = React.createContext<ZoomableContextType | null>(null);

export const ZoomableProvider = zoomableContext.Provider;
export const ZoomableConsumer = zoomableContext.Consumer;

export const withZoomableContext = <C extends React.ElementType>(
  component: C
) => (props: Omit<React.ComponentProps<C>, 'zoomContext'>) => {
  const Component: any = component; // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <ZoomableConsumer>
      {zoomContext => <Component {...props} zoomContext={zoomContext} />}
    </ZoomableConsumer>
  );
};
