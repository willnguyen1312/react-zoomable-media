import React from 'react';
import { ZoomableContextType, withZoomableContext } from './ZoomableContext';

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
        <div
          style={{
            zIndex: 1312,
            backgroundColor: '#000',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
          ref={wrapperRef}
        >
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              transformOrigin: '0 0',
              cursor: 'move',
              width,
              height,
              transform: `translate(${positionX}px, ${positionY}px) scale(${currentZoom})`,
            }}
          >
            <img
              style={{
                width,
                height,
              }}
              ref={imageRef}
              src={imageUrl}
            />
          </div>
          {isLoading && renderedLoading}
        </div>
      );
    }
  }
);
