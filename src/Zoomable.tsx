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

const Zoomable: FC<ZoomableProps> = ({
  children,
  moveStep,
  maxZoom,
  wheelZoomRatio,
  zoomStep,
}) => {
  const wrapperRef = useRef<HTMLDivElement>() as React.MutableRefObject<
    HTMLDivElement
  >;
  const sliderRef = useRef<HTMLDivElement>() as React.MutableRefObject<
    HTMLDivElement
  >;
  const imageRef = useRef<HTMLImageElement>() as React.MutableRefObject<
    HTMLImageElement
  >;

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

  const onImageLoad = () => {
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

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isOnMove) {
      event.preventDefault();
      const { pageX, pageY } = event;
      const offsetX = pageX - startX;
      const offsetY = pageY - startY;

      setPositionX(calculatePositionX(lastPositionX + offsetX, currentZoom));
      setPositionY(calculatePositionY(lastPositionY + offsetY, currentZoom));
    }
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

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

    const zoomPointX = event.pageX - offsetLeft;
    const zoomPointY = event.pageY - offsetTop;

    const delta = clamp(event.deltaY, -0.5, 0.5);

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

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { pageX, pageY } = event;

    setLastPositionX(positionX);
    setLastPositionY(positionY);
    setStartX(pageX);
    setStartY(pageY);
    setIsOnMove(true);
  };

  const handleMouseUp = () => setIsOnMove(false);

  return (
    <ZoomableProvider
      value={{
        width,
        height,
        handleMouseUp,
        updatePercentage,
        handleMouseDown,
        handleMouseMove,
        onWheel,
        wrapperRef,
        imageRef,
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
