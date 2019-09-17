import React from 'react';
import styled from 'styled-components';
import { ZoomableContextType, withZoomableContext } from './ZoomContext';

const Wrapper = styled.div`
  width: 100%;
  overflow: hidden;
`;

interface SliderProps {
  transform: string;
}

const Slider = styled.div<SliderProps>`
  transform-origin: 0 0;
  cursor: move;
  width: 100%;
  transform: ${props => props.transform};
`;

interface ImageProps {
  zoomContext: ZoomableContextType;
}

export default withZoomableContext(
  class extends React.Component<ImageProps> {
    componentDidMount() {
      const {
        zoomContext: { sliderRef, onWheel },
      } = this.props;

      const slider = sliderRef.current as HTMLDivElement;

      slider.addEventListener('wheel', onWheel);
    }

    render() {
      const { zoomContext, children } = this.props;
      if (!zoomContext) {
        return null;
      }

      const {
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
            transform={`translate(${positionX}px, ${positionY}px) scale(${currentZoom})`}
          >
            {children}
          </Slider>
        </Wrapper>
      );
    }
  }
);
