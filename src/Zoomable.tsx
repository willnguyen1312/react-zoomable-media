import React, { FC, useRef, useState, useEffect } from 'react';

import { ZoomableProvider } from './ZoomableContext';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface ZoomableProps {
  enable: boolean;
  maxZoom: number;
  wheelZoomRatio: number;
  zoomStep: number;
  moveStep: number;
}

const initialState = {
  height: 0,
  width: 0,
  currentZoom: 1,
  percentage: 0,
  lastPositionX: 0,
  lastPositionY: 0,
  positionX: 0,
  positionY: 0,
  isOnMove: false,
  startX: 0,
  startY: 0,
};

type PartialState = Partial<typeof initialState>;

const Zoomable: FC<ZoomableProps> = ({
  children,
  enable,
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

  const [state, setState] = useState(initialState);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousemove', handleMouseMoveOutOfBound);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', handleMouseMoveOutOfBound);
    };
  }, []);

  useEffect(() => {
    updateState(initialState);
  }, [enable]);

  const calculatePositionX = (newPositionX: number, currentZoom: number) => {
    const { width } = state;
    if (newPositionX > 0) return 0;
    if (newPositionX + width * currentZoom < width)
      return -width * (currentZoom - 1);
    return newPositionX;
  };

  const calculatePositionY = (newPositionY: number, currentZoom: number) => {
    const { height } = state;
    if (newPositionY > 0) return 0;
    if (newPositionY + height * currentZoom < height)
      return -height * (currentZoom - 1);
    return newPositionY;
  };

  const updateState = (partialState: PartialState) =>
    setState(prevState => ({
      ...prevState,
      ...partialState,
    }));

  const handleKeydown = (event: KeyboardEvent) => {
    const { positionX, positionY, currentZoom } = state;
    const handlers: Record<string, () => void> = {
      ArrowUp: () => {
        updateState({
          positionY: calculatePositionY(positionY + moveStep, currentZoom),
        });
      },
      ArrowDown: () => {
        updateState({
          positionY: calculatePositionY(positionY - moveStep, currentZoom),
        });
      },
      ArrowRight: () => {
        updateState({
          positionX: calculatePositionX(positionX - moveStep, currentZoom),
        });
      },
      ArrowLeft: () => {
        updateState({
          positionX: calculatePositionX(positionX + moveStep, currentZoom),
        });
      },
    };

    const handler = handlers[event.key];

    if (handler) {
      event.preventDefault();
      handler();
    }
  };

  const handleMouseMoveOutOfBound = (event: MouseEvent) => {
    if (state.isOnMove) {
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
        updateState({ isOnMove: false });
      }
    }
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
      updateState({
        width: clientWidth,
        height: clientWidth / imageRatio,
      });
    } else {
      updateState({
        width: clientHeight * imageRatio,
        height: clientHeight,
      });
    }
  };

  const onVideoLoad = () => {
    const wrapper = wrapperRef.current as HTMLDivElement;
    const video = wrapper.querySelector('video') as HTMLVideoElement;
    const { clientWidth, clientHeight } = video;

    updateState({
      width: clientWidth,
      height: clientHeight,
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (state.isOnMove) {
      event.preventDefault();
      const {
        startX,
        startY,
        lastPositionX,
        lastPositionY,
        currentZoom,
      } = state;
      const { pageX, pageY } = event;
      const offsetX = pageX - startX;
      const offsetY = pageY - startY;

      updateState({
        positionX: calculatePositionX(lastPositionX + offsetX, currentZoom),
        positionY: calculatePositionY(lastPositionY + offsetY, currentZoom),
      });
    }
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const { currentZoom, positionX, positionY, width, height } = state;

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

    updateState({
      positionX: calculatePositionX(
        -zoomTargetX * newCurrentZoom + zoomPointX,
        newCurrentZoom
      ),
      positionY: calculatePositionY(
        -zoomTargetY * newCurrentZoom + zoomPointY,
        newCurrentZoom
      ),
      currentZoom: newCurrentZoom,
      percentage: newPercentage,
    });
  };

  const setPercentage = (newPercentage: number) => {
    const { width, height, positionX, positionY, currentZoom } = state;
    const newCurrentZoom = calculateCurrentZoom(newPercentage);

    const zoomPointX = width / 2;
    const zoomPointY = height / 2;

    const zoomTargetX = (width / 2 - positionX) / currentZoom;
    const zoomTargetY = (height / 2 - positionY) / currentZoom;

    const newPositionX = calculatePositionX(
      -zoomTargetX * newCurrentZoom + zoomPointX,
      newCurrentZoom
    );
    const newPositionY = calculatePositionY(
      -zoomTargetY * newCurrentZoom + zoomPointY,
      newCurrentZoom
    );

    updateState({
      percentage: newPercentage,
      positionX: newPositionX,
      positionY: newPositionY,
      currentZoom: newCurrentZoom,
    });
  };

  const zoomIn = () =>
    setPercentage(Math.min(state.percentage + zoomStep, 100));

  const zoomOut = () => setPercentage(Math.max(0, state.percentage - zoomStep));

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { pageX, pageY } = event;
    const { positionX, positionY } = state;

    updateState({
      lastPositionX: positionX,
      lastPositionY: positionY,
      startX: pageX,
      startY: pageY,
      isOnMove: true,
    });
  };

  const handleMouseUp = () => {
    updateState({
      isOnMove: false,
    });
  };

  return (
    <ZoomableProvider
      value={{
        ...state,
        handleMouseUp: handleMouseUp,
        setPercentage: setPercentage,
        handleMouseDown: handleMouseDown,
        handleMouseMove: handleMouseMove,
        onWheel: onWheel,
        wrapperRef: wrapperRef,
        imageRef: imageRef,
        sliderRef: sliderRef,
        onImageLoad: onImageLoad,
        onVideoLoad: onVideoLoad,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
      }}
    >
      {children}
    </ZoomableProvider>
  );
};

export default Zoomable;
