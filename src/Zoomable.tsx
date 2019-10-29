import React, { FC, useRef, useState, useEffect } from 'react';
import { useEventListener } from './hooks';

import { ZoomableProvider } from './ZoomableContext';
import { fullscreenLookup } from './helper';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface ZoomableProps {
  id?: string;
  enable: boolean;
  maxZoom: number;
  wheelZoomRatio: number;
  zoomStep: number;
  moveStep: number;
  up?: string;
  down?: string;
  left?: string;
  right?: string;
}

type PointerPosition = {
  x: number;
  y: number;
};
const pointers = new Map<number, PointerPosition>();
let prevDistance = -1;
const ZOOM_DELTA = 0.5;
let mediaElement: HTMLImageElement | HTMLVideoElement | undefined;

export const Zoomable: FC<ZoomableProps> = ({
  id,
  enable,
  children,
  moveStep,
  maxZoom,
  wheelZoomRatio,
  zoomStep,
  up,
  down,
  left,
  right,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState<number>(1);
  const [height, setHeight] = useState<number>(1);
  const [lastWidth, setlastWidth] = useState<number>(1);
  const [lastHeight, setlastHeight] = useState<number>(1);
  const [currentZoom, setCurrentZoom] = useState<number>(1);
  const [percentage, setPercentage] = useState<number>(0);
  const [lastPositionX, setLastPositionX] = useState<number>(0);
  const [lastPositionY, setLastPositionY] = useState<number>(0);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [isOnMove, setIsOnMove] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [wrapperWidthNormal, setWrapperWidthNormal] = useState<number>(1);
  const [wrapperHeightNormal, setWrapperHeightNormal] = useState<number>(1);
  const [wrapperWidthFullscreen, setWrapperWidthFullscreen] = useState<number>(
    1
  );
  const [wrapperHeightFullscreen, setWrapperHeightFullscreen] = useState<
    number
  >(1);

  useEffect(() => {
    calculateNewPositions();
  }, [width, lastWidth, height, lastHeight]);

  useEffect(() => {
    enableFocus();
  }, [enable]);

  const handleKeydown = (event: Event) => {
    if (event instanceof KeyboardEvent) {
      const { shiftKey, key } = event;
      const handlers: Record<string, () => void> = {
        [up || 'ArrowUp']: () =>
          setPositionY(calculatePositionY(positionY + moveStep, currentZoom)),
        [down || 'ArrowDown']: () =>
          setPositionY(calculatePositionY(positionY - moveStep, currentZoom)),
        [left || 'ArrowLeft']: () => {
          if (shiftKey) {
            zoomOut();
          } else {
            setPositionX(calculatePositionX(positionX + moveStep, currentZoom));
          }
        },
        [right || 'ArrowRight']: () => {
          if (shiftKey) {
            zoomIn();
          } else {
            setPositionX(calculatePositionX(positionX - moveStep, currentZoom));
          }
        },
        [up || 'up']: () =>
          setPositionY(calculatePositionY(positionY + moveStep, currentZoom)),
        [down || 'down']: () =>
          setPositionY(calculatePositionY(positionY - moveStep, currentZoom)),
        [left || 'left']: () => {
          if (shiftKey) {
            zoomOut();
          } else {
            setPositionX(calculatePositionX(positionX + moveStep, currentZoom));
          }
        },
        [right || 'right']: () => {
          if (shiftKey) {
            zoomIn();
          } else {
            setPositionX(calculatePositionX(positionX - moveStep, currentZoom));
          }
        },
      };

      const handler = handlers[key];

      if (handler) {
        event.preventDefault();
        handler();
      }
    }
  };

  const enableFocus = () => {
    if (enable) {
      (wrapperRef.current as HTMLDivElement).focus();
    }
  };

  const handleMouseMoveOutOfBound = (event: Event) => {
    if (isOnMove && event instanceof MouseEvent) {
      event.preventDefault();
      const wrapper = wrapperRef.current as HTMLDivElement;
      const wrapperRect = wrapper.getBoundingClientRect();
      const x = event.pageX - wrapperRect.left;
      const y = event.pageY - wrapperRect.top;
      if (
        x > wrapper.clientWidth ||
        x < 0 ||
        y > wrapper.clientHeight ||
        y < 0
      ) {
        setIsOnMove(false);
      }
    }
  };

  const setWrapperDimensions = () => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      const { offsetWidth, offsetHeight } = wrapper;

      if (checkFullscreen()) {
        setWrapperWidthFullscreen(offsetWidth);
        setWrapperHeightFullscreen(offsetHeight);
        setIsFullscreen(true);
      } else {
        setWrapperWidthNormal(isFullscreen ? wrapperWidthNormal : offsetWidth);
        setWrapperHeightNormal(
          isFullscreen ? wrapperHeightNormal : offsetHeight
        );
        setIsFullscreen(false);
      }
    }
  };

  const processMedia = () => {
    if (mediaElement instanceof HTMLImageElement) {
      processImage();
    }
    if (mediaElement instanceof HTMLVideoElement) {
      processVideo();
    }
  };

  useEventListener('keydown', handleKeydown);
  useEventListener('mousemove', handleMouseMoveOutOfBound);
  useEventListener('resize', setWrapperDimensions);

  if (fullscreenLookup) {
    useEventListener(fullscreenLookup.fullscreenchange, setWrapperDimensions);
    useEventListener(fullscreenLookup.fullscreenchange, processMedia);
  }

  const calculatePositionX = (newPositionX: number, currentZoom: number) => {
    if (newPositionX > 0) return 0;
    if (newPositionX + width * currentZoom < width)
      return -width * (currentZoom - 1);
    return newPositionX;
  };

  const calculatePositionY = (newPositionY: number, currentZoom: number) => {
    if (newPositionY > 0) return 0;
    if (newPositionY + height * currentZoom < height)
      return -height * (currentZoom - 1);
    return newPositionY;
  };

  const scaleLinear = (
    domainStart: number,
    domainstop: number,
    rangeStart: number,
    rangeStop: number
  ) => (value: number) =>
    rangeStart +
    (rangeStop - rangeStart) *
      ((value - domainStart) / (domainstop - domainStart));

  const calculatePercentage = scaleLinear(1, maxZoom, 0, 100);

  const calculateCurrentZoom = scaleLinear(0, 100, 1, maxZoom);

  const processImage = () => {
    const image = mediaElement as HTMLImageElement;

    const { naturalWidth, naturalHeight } = image;
    const { newWidth, newHeight } = calculateDimensions({
      mediaWidth: naturalWidth,
      mediaHeight: naturalHeight,
    });

    setlastWidth(width);
    setlastHeight(height);
    setWidth(newWidth);
    setHeight(newHeight);
  };

  const checkFullscreen = () => {
    if (fullscreenLookup) {
      return Boolean((document as any)[fullscreenLookup.fullscreenElement]);
    }
    return false;
  };

  const getWrapperDimensions = () => {
    if (checkFullscreen()) {
      return {
        wrapperWidth: wrapperWidthFullscreen,
        wrapperHeight: wrapperHeightFullscreen,
      };
    } else {
      return {
        wrapperWidth: wrapperWidthNormal,
        wrapperHeight: wrapperHeightNormal,
      };
    }
  };

  const calculateDimensions = ({
    mediaWidth,
    mediaHeight,
  }: {
    mediaWidth: number;
    mediaHeight: number;
  }) => {
    const mediaRatio = mediaWidth / mediaHeight;
    const { wrapperWidth, wrapperHeight } = getWrapperDimensions();
    const wrapperRatio = wrapperWidth / wrapperHeight;

    let newWidth = 0;
    let newHeight = 0;

    if (mediaRatio >= wrapperRatio) {
      newWidth = wrapperWidth;
      newHeight = newWidth / mediaRatio;
    } else {
      newHeight = wrapperHeight;
      newWidth = newHeight * mediaRatio;
    }

    return { newWidth, newHeight };
  };

  const processVideo = async () => {
    const video = mediaElement as HTMLVideoElement;
    // Safari doesn't handle the video event's onloadedMetadata the same as other browsers
    // Wait until the video element dimensions ready and continue
    while (video.videoWidth === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const { videoWidth, videoHeight } = video;
    const { newWidth, newHeight } = calculateDimensions({
      mediaWidth: videoWidth,
      mediaHeight: videoHeight,
    });

    setlastWidth(width);
    setlastHeight(height);
    setWidth(newWidth);
    setHeight(newHeight);
  };

  const calculateNewPositions = () => {
    const widthRatio = width / lastWidth;
    const heightRatio = height / lastHeight;

    setPositionX(positionX * widthRatio);
    setPositionY(positionY * heightRatio);
  };

  const onMediaReady = (
    mediaRef: React.RefObject<HTMLImageElement | HTMLVideoElement>
  ) => {
    let media = mediaRef.current as HTMLImageElement | HTMLVideoElement;
    mediaElement = media;
    processMedia();
  };

  const processZoom = ({
    delta,
    x,
    y,
  }: {
    delta: number;
    x: number;
    y: number;
  }) => {
    const wrapper = wrapperRef.current as HTMLDivElement;
    const wrapperRect = wrapper.getBoundingClientRect();

    const offsetLeft =
      wrapperRect.left +
      document.documentElement.scrollLeft +
      (wrapper.clientWidth - width) / 2;
    const offsetTop =
      wrapperRect.top +
      document.documentElement.scrollTop +
      (wrapper.clientHeight - height) / 2;
    const zoomPointX = x - offsetLeft;
    const zoomPointY = y - offsetTop;

    const zoomTargetX = (zoomPointX - positionX) / currentZoom;
    const zoomTargetY = (zoomPointY - positionY) / currentZoom;

    const newCurrentZoom = clamp(
      currentZoom + delta * wheelZoomRatio * currentZoom,
      1,
      maxZoom
    );
    const newPercentage = calculatePercentage(newCurrentZoom);

    setPositionX(
      calculatePositionX(
        -zoomTargetX * newCurrentZoom + zoomPointX,
        newCurrentZoom
      )
    );
    setPositionY(
      calculatePositionY(
        -zoomTargetY * newCurrentZoom + zoomPointY,
        newCurrentZoom
      )
    );
    setCurrentZoom(newCurrentZoom);
    setPercentage(newPercentage);
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const delta = -clamp(event.deltaY, -ZOOM_DELTA, ZOOM_DELTA);
    processZoom({ delta, x: event.pageX, y: event.pageY });
  };

  const updatePercentage = (newPercentage: number) => {
    const newCurrentZoom = calculateCurrentZoom(newPercentage);

    const zoomPointX = width / 2;
    const zoomPointY = height / 2;

    const zoomTargetX = (width / 2 - positionX) / currentZoom;
    const zoomTargetY = (height / 2 - positionY) / currentZoom;

    setPercentage(newPercentage);
    setPositionX(
      calculatePositionX(
        -zoomTargetX * newCurrentZoom + zoomPointX,
        newCurrentZoom
      )
    );
    setPositionY(
      calculatePositionY(
        -zoomTargetY * newCurrentZoom + zoomPointY,
        newCurrentZoom
      )
    );
    setCurrentZoom(newCurrentZoom);
  };

  const zoomIn = () => updatePercentage(Math.min(percentage + zoomStep, 100));

  const zoomOut = () => updatePercentage(Math.max(0, percentage - zoomStep));

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { pageX, pageY, pointerId } = event;
    setIsOnMove(true);
    setLastPositionX(positionX);
    setLastPositionY(positionY);
    setStartX(pageX);
    setStartY(pageY);
    pointers.set(pointerId, { x: pageX, y: pageY });
  };

  const getPointersCenter = () => {
    let x = 0;
    let y = 0;

    pointers.forEach(value => {
      x += value.x;
      y += value.y;
    });

    x /= pointers.size;
    y /= pointers.size;

    return {
      x,
      y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const { pageX, pageY, pointerId } = event;
    for (const [cachedPointerid] of pointers.entries()) {
      if (cachedPointerid === pointerId) {
        pointers.set(cachedPointerid, { x: pageX, y: pageY });
      }
    }

    if (isOnMove) {
      event.preventDefault();
      if (pointers.size === 1) {
        const offsetX = pageX - startX;
        const offsetY = pageY - startY;

        setPositionX(calculatePositionX(lastPositionX + offsetX, currentZoom));
        setPositionY(calculatePositionY(lastPositionY + offsetY, currentZoom));
      }
      if (pointers.size === 2) {
        const pointersIterator = pointers.values();
        const first = pointersIterator.next().value as PointerPosition;
        const second = pointersIterator.next().value as PointerPosition;
        const curDistance = Math.sqrt(
          Math.pow(first.x - second.x, 2) + Math.pow(first.y - second.y, 2)
        );

        const { x, y } = getPointersCenter();

        if (prevDistance > 0) {
          if (curDistance > prevDistance) {
            // The distance between the two pointers has increased
            processZoom({ delta: ZOOM_DELTA, x, y });
          }
          if (curDistance < prevDistance) {
            // The distance between the two pointers has decreased
            processZoom({ delta: -ZOOM_DELTA, x, y });
          }
        }

        // Cache the distance for the next move event
        prevDistance = curDistance;
      }
    }
  };

  const handlePointerUp = () => {
    pointers.clear();
    setIsOnMove(false);
  };

  const getMediaDimensions = () => {
    return {
      mediaWidth:
        mediaElement instanceof HTMLImageElement
          ? mediaElement.naturalWidth
          : (mediaElement as HTMLVideoElement).videoWidth,
      mediaHeight:
        mediaElement instanceof HTMLImageElement
          ? mediaElement.naturalHeight
          : (mediaElement as HTMLVideoElement).videoHeight,
    };
  };

  const cropImage = (imageDataCallbackHandler: (imageData: string) => void) => {
    const { wrapperWidth, wrapperHeight } = getWrapperDimensions();
    const {
      clientWidth: contentWidth,
      clientHeight: contentHeight,
    } = contentRef.current as HTMLDivElement;
    const { mediaWidth } = getMediaDimensions();
    const scale = mediaWidth / (width * currentZoom);
    const croppedCanvasWidth = Math.min(
      wrapperWidth,
      contentWidth * currentZoom
    );
    const croppedCanvasHeight = Math.min(
      wrapperHeight,
      contentHeight * currentZoom
    );
    const canvas = document.createElement('canvas');
    const croppedImageWidth = croppedCanvasWidth * scale;
    const croppedImageHeight = croppedCanvasHeight * scale;
    canvas.width = croppedImageWidth;
    canvas.height = croppedImageHeight;
    const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;

    const sx = Math.max(
      0,
      (Math.abs(positionX) - (wrapperWidth - contentWidth) / 2) * scale
    );
    const sy = Math.max(
      0,
      (Math.abs(positionY) - (wrapperHeight - contentHeight) / 2) * scale
    );
    const sw = croppedImageWidth;
    const sh = croppedImageHeight;

    const dx = 0;
    const dy = 0;
    const dw = croppedImageWidth;
    const dh = croppedImageHeight;

    canvasContext.drawImage(
      mediaElement as HTMLImageElement,
      sx,
      sy,
      sw,
      sh,
      dx,
      dy,
      dw,
      dh
    );

    imageDataCallbackHandler(canvas.toDataURL('image/jpeg', 1.0));
  };

  return (
    <ZoomableProvider
      value={{
        id,
        enable,
        width,
        height,
        updatePercentage,
        handlePointerUp,
        handlePointerDown,
        handlePointerMove,
        setWrapperDimensions,
        onWheel,
        enableFocus,
        wrapperRef,
        contentRef,
        cropImage,
        onMediaReady,
        zoomIn,
        zoomOut,
        currentZoom,
        isOnMove,
        lastPositionX,
        lastPositionY,
        percentage,
        positionX,
        positionY,
        startX,
        startY,
      }}
    >
      {children}
    </ZoomableProvider>
  );
};
