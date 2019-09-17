import React from 'react';
import styled from 'styled-components';
import { ZoomableContextType, withZoomableContext } from './ZoomableContext';

const Wrapper = styled.div`
  z-index: 1312;
  background-color: #000;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

interface SliderProps {
  width: number;
  height: number;
  transform: string;
}

const Slider = styled.div<SliderProps>`
  transform-origin: 0 0;
  cursor: move;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  transform: ${props => props.transform};
`;

interface ImageProps {
  imageUrl: string;
  loading: React.ReactNode;
  zoomContext: ZoomableContextType;
}

export default withZoomableContext(
  class extends React.Component<ImageProps> {
    state = { isLoading: true };

    componentDidMount() {
      const {
        zoomContext: { imageRef, sliderRef, onImageLoad, onWheel },
      } = this.props;

      const image = imageRef.current as HTMLImageElement;
      const slider = sliderRef.current as HTMLDivElement;

      image.onload = () => {
        onImageLoad();
        this.setState({ isLoading: false });
      };

      slider.addEventListener('wheel', onWheel);
    }

    render() {
      const { zoomContext, imageUrl, loading } = this.props;
      const { isLoading } = this.state;
      if (!zoomContext) {
        return null;
      }

      const renderedLoading = loading ? loading : <p>loading...</p>;

      const {
        width,
        height,
        imageRef,
        wrapperRef,
        currentZoom,
        sliderRef,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        positionX,
        positionY,
      } = zoomContext;

      return (
        <Wrapper ref={wrapperRef}>
          <Slider
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            width={width}
            height={height}
            transform={`translate(${positionX}px, ${positionY}px) scale(${currentZoom})`}
          >
            <img
              style={{
                width,
                height,
              }}
              ref={imageRef}
              src={imageUrl}
            />
          </Slider>
          {isLoading && renderedLoading}
        </Wrapper>
      );
    }
  }
);
