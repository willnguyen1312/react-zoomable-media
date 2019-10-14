import React, { FC, useRef, useState } from 'react';
import { useDocumentEventListener } from './hooks';

import { ZoomableProvider } from './ZoomableContext';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface ZoomableProps {
  maxZoom: number;
  wheelZoomRatio: number;
  zoomStep: number;
  moveStep: number;
}

type PointerPositionMap = {
  [pointerId: string]: {
    x: number;
    y: number;
  };
};
let pointers: PointerPositionMap = {};
let prevDistance = -1;
const ZOOM_DELTA = 0.5;

const Zoomable: FC<ZoomableProps> = ({
  children,
  moveStep,
  maxZoom,
  wheelZoomRatio,
  zoomStep,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [currentZoom, setCurrentZoom] = useState<number>(1);
  const [percentage, setPercentage] = useState<number>(0);
  const [lastPositionX, setLastPositionX] = useState<number>(0);
  const [lastPositionY, setLastPositionY] = useState<number>(0);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [isOnMove, setIsOnMove] = useState<boolean>(false);

  const handleKeydown = (event: Event) => {
    if (event instanceof KeyboardEvent) {
      const handlers: Record<string, () => void> = {
        ArrowUp: () =>
          setPositionY(calculatePositionY(positionY + moveStep, currentZoom)),
        ArrowDown: () =>
          setPositionY(calculatePositionY(positionY - moveStep, currentZoom)),
        ArrowRight: () =>
          setPositionX(calculatePositionX(positionX - moveStep, currentZoom)),
        ArrowLeft: () =>
          setPositionX(calculatePositionX(positionX + moveStep, currentZoom)),
      };

      const handler = handlers[event.key];

      if (handler) {
        event.preventDefault();
        handler();
      }
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

  useDocumentEventListener('keydown', handleKeydown);
  useDocumentEventListener('mousemove', handleMouseMoveOutOfBound);

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

  const onImageLoad = (imageRef: React.RefObject<HTMLImageElement>) => {
    const image = imageRef.current as HTMLImageElement;

    const { clientWidth, clientHeight } = wrapperRef.current as HTMLDivElement;
    const { naturalWidth, naturalHeight } = image;

    const imageRatio = naturalWidth / naturalHeight;
    const wrapperRatio = clientWidth / clientHeight;

    if (imageRatio >= wrapperRatio) {
      const width = clientWidth;
      const height = clientWidth / imageRatio;
      setWidth(width);
      setHeight(height);
    } else {
      const width = clientHeight * imageRatio;
      const height = clientHeight;
      setWidth(width);
      setHeight(height);
    }
  };

  const onVideoLoad = () => {
    const wrapper = wrapperRef.current as HTMLDivElement;
    const video = wrapper.querySelector('video') as HTMLVideoElement;
    const { clientWidth, clientHeight } = video;

    setWidth(clientWidth);
    setHeight(clientHeight);
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
    event.preventDefault();
    const delta = clamp(event.deltaY, -ZOOM_DELTA, ZOOM_DELTA);
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

  const zoomIn = () => setPercentage(Math.min(percentage + zoomStep, 100));

  const zoomOut = () => setPercentage(Math.max(0, percentage - zoomStep));

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { pageX, pageY, pointerId } = event;
    setIsOnMove(true);
    setLastPositionX(positionX);
    setLastPositionY(positionY);
    setStartX(pageX);
    setStartY(pageY);
    pointers[pointerId] = { x: pageX, y: pageY };
  };

  const getPointersCenter = () => {
    const values = Object.values(pointers);

    const { sumX, sumY } = values.reduce(
      (acc, cur) => {
        acc.sumX += cur.x;
        acc.sumY += cur.y;
        return acc;
      },
      { sumX: 0, sumY: 0 }
    );

    const x = sumX / values.length;
    const y = sumY / values.length;

    return {
      x,
      y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const { pageX, pageY, pointerId } = event;
    const keyValuePairs = Object.entries(pointers);

    keyValuePairs.forEach(([key]) => {
      if (key === pointerId.toString()) pointers[key] = { x: pageX, y: pageY };
    });

    if (isOnMove) {
      event.preventDefault();
      if (keyValuePairs.length == 1) {
        const offsetX = pageX - startX;
        const offsetY = pageY - startY;

        setPositionX(calculatePositionX(lastPositionX + offsetX, currentZoom));
        setPositionY(calculatePositionY(lastPositionY + offsetY, currentZoom));
      }
      if (keyValuePairs.length === 2) {
        const [, first] = keyValuePairs[0];
        const [, second] = keyValuePairs[1];
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
    pointers = {};
    setIsOnMove(false);
  };

  return (
    <ZoomableProvider
      value={{
        width,
        height,
        updatePercentage,
        handlePointerUp,
        handlePointerDown,
        handlePointerMove,
        onWheel,
        wrapperRef,
        sliderRef,
        onImageLoad,
        onVideoLoad,
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

export default Zoomable;
