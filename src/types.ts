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
