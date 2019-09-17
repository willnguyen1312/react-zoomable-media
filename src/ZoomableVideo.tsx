import React from 'react';
import { ZoomableContextType, withZoomableContext } from './ZoomableContext';

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
        <div style={{ width: '100%', overflow: 'hidden' }} ref={wrapperRef}>
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              transformOrigin: '0 0',
              cursor: 'move',
              width: '100%',
              transform: `translate(${positionX}px, ${positionY}px) scale(${currentZoom})`,
            }}
          >
            {children}
          </div>
        </div>
      );
    }
  }
);
