import React from 'react';

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

class Zoomable extends React.Component<ZoomableProps> {
  wrapperRef = React.createRef<HTMLDivElement>();
  imageRef = React.createRef<HTMLImageElement>();
  sliderRef = React.createRef<HTMLDivElement>();

  initialState = {
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

  state = this.initialState;

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('mousemove', this.handleMouseMoveOutOfBound);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('mousemove', this.handleMouseMoveOutOfBound);
  }

  componentDidUpdate(prevProps: ZoomableProps) {
    if (prevProps.enable !== this.props.enable) {
      this.setState(this.initialState);
    }
  }

  handleMouseMoveOutOfBound = (event: MouseEvent) => {
    if (this.state.isOnMove) {
      event.preventDefault();
      const wrapper = this.wrapperRef.current as HTMLDivElement;
      const wrapperRect = wrapper.getBoundingClientRect();
      const x = event.pageX - wrapperRect.left;
      const y = event.pageY - wrapperRect.top;
      if (
        x > wrapper.clientWidth ||
        x < 0 ||
        y > wrapper.clientHeight ||
        y < 0
      ) {
        this.setState({ isOnMove: false });
      }
    }
  };

  calculatePositionX = (newPositionX: number, currentZoom: number) => {
    const { width } = this.state;
    if (newPositionX > 0) return 0;
    if (newPositionX + width * currentZoom < width)
      return -width * (currentZoom - 1);
    return newPositionX;
  };

  calculatePositionY = (newPositionY: number, currentZoom: number) => {
    const { height } = this.state;
    if (newPositionY > 0) return 0;
    if (newPositionY + height * currentZoom < height)
      return -height * (currentZoom - 1);
    return newPositionY;
  };

  scaleLinear = (
    domainStart: number,
    domainstop: number,
    rangeStart: number,
    rangeStop: number
  ) => (value: number) =>
    rangeStart +
    (rangeStop - rangeStart) *
      ((value - domainStart) / (domainstop - domainStart));

  calculatePercentage = this.scaleLinear(1, this.props.maxZoom, 0, 100);

  calculateCurrentZoom = this.scaleLinear(0, 100, 1, this.props.maxZoom);

  handleKeydown = (event: KeyboardEvent) => {
    const { moveStep } = this.props;
    const { positionX, positionY, currentZoom } = this.state;
    const handlers: Record<string, () => void> = {
      ArrowUp: () => {
        this.setState({
          positionY: this.calculatePositionY(positionY + moveStep, currentZoom),
        });
      },
      ArrowDown: () => {
        this.setState({
          positionY: this.calculatePositionY(positionY - moveStep, currentZoom),
        });
      },
      ArrowRight: () => {
        this.setState({
          positionX: this.calculatePositionX(positionX - moveStep, currentZoom),
        });
      },
      ArrowLeft: () => {
        this.setState({
          positionX: this.calculatePositionX(positionX + moveStep, currentZoom),
        });
      },
    };

    const handler = handlers[event.key];

    if (handler) {
      event.preventDefault();
      handler();
    }
  };

  onImageLoad = () => {
    const image = this.imageRef.current as HTMLImageElement;

    const { clientWidth, clientHeight } = this.wrapperRef
      .current as HTMLDivElement;
    const { naturalWidth, naturalHeight } = image;

    const imageRatio = naturalWidth / naturalHeight;
    const wrapperRatio = clientWidth / clientHeight;

    if (imageRatio >= wrapperRatio) {
      this.setState({
        width: clientWidth,
        height: clientWidth / imageRatio,
      });
    } else {
      this.setState({
        width: clientHeight * imageRatio,
        height: clientHeight,
      });
    }
  };

  onVideoLoad = () => {
    const wrapper = this.wrapperRef.current as HTMLDivElement;
    const video = wrapper.querySelector('video') as HTMLVideoElement;
    const { clientWidth, clientHeight } = video;

    this.setState({
      width: clientWidth,
      height: clientHeight,
    });
  };

  handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (this.state.isOnMove) {
      event.preventDefault();
      const {
        startX,
        startY,
        lastPositionX,
        lastPositionY,
        currentZoom,
      } = this.state;
      const { pageX, pageY } = event;
      const offsetX = pageX - startX;
      const offsetY = pageY - startY;

      this.setState({
        positionX: this.calculatePositionX(
          lastPositionX + offsetX,
          currentZoom
        ),
        positionY: this.calculatePositionY(
          lastPositionY + offsetY,
          currentZoom
        ),
      });
    }
  };

  onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const { maxZoom, wheelZoomRatio } = this.props;
    const { currentZoom, positionX, positionY, width, height } = this.state;

    const wrapper = this.wrapperRef.current as HTMLDivElement;
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
    const newPercentage = this.calculatePercentage(newCurrentZoom);

    this.setState({
      positionX: this.calculatePositionX(
        -zoomTargetX * newCurrentZoom + zoomPointX,
        newCurrentZoom
      ),
      positionY: this.calculatePositionY(
        -zoomTargetY * newCurrentZoom + zoomPointY,
        newCurrentZoom
      ),
      currentZoom: newCurrentZoom,
      percentage: newPercentage,
    });
  };

  setPercentage = (newPercentage: number) => {
    const { width, height, positionX, positionY, currentZoom } = this.state;
    const newCurrentZoom = this.calculateCurrentZoom(newPercentage);

    const zoomPointX = width / 2;
    const zoomPointY = height / 2;

    const zoomTargetX = (width / 2 - positionX) / currentZoom;
    const zoomTargetY = (height / 2 - positionY) / currentZoom;

    const newPositionX = this.calculatePositionX(
      -zoomTargetX * newCurrentZoom + zoomPointX,
      newCurrentZoom
    );
    const newPositionY = this.calculatePositionY(
      -zoomTargetY * newCurrentZoom + zoomPointY,
      newCurrentZoom
    );

    this.setState({
      percentage: newPercentage,
      positionX: newPositionX,
      positionY: newPositionY,
      currentZoom: newCurrentZoom,
    });
  };

  zoomIn = () =>
    this.setPercentage(
      Math.min(this.state.percentage + this.props.zoomStep, 100)
    );

  zoomOut = () =>
    this.setPercentage(
      Math.max(0, this.state.percentage - this.props.zoomStep)
    );

  handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { pageX, pageY } = event;
    const { positionX, positionY } = this.state;

    this.setState({
      lastPositionX: positionX,
      lastPositionY: positionY,
      startX: pageX,
      startY: pageY,
      isOnMove: true,
    });
  };

  handleMouseUp = () => {
    this.setState({
      isOnMove: false,
    });
  };

  render() {
    const { children } = this.props;
    return (
      <ZoomableProvider
        value={{
          ...this.state,
          handleMouseUp: this.handleMouseUp,
          setPercentage: this.setPercentage,
          handleMouseDown: this.handleMouseDown,
          handleMouseMove: this.handleMouseMove,
          onWheel: this.onWheel,
          wrapperRef: this.wrapperRef,
          imageRef: this.imageRef,
          sliderRef: this.sliderRef,
          onImageLoad: this.onImageLoad,
          onVideoLoad: this.onVideoLoad,
          zoomIn: this.zoomIn,
          zoomOut: this.zoomOut,
        }}
      >
        {children}
      </ZoomableProvider>
    );
  }
}

export default Zoomable;
