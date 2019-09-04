import React from 'react';
import styled from 'styled-components';

// function log(arg: any) {
//   console.log(arg);
// }

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
`;

const Slider = styled.div`
  flex: 0 0 100%;
  height: 100%;
  transition: transform 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

export class Zoomable extends React.Component {
  wrapperRef = React.createRef<HTMLDivElement>();
  imageRef = React.createRef<HTMLImageElement>();
  sliderRef = React.createRef<HTMLDivElement>();

  state = {
    imageHeight: 0,
    imageWidth: 0,
  };

  componentDidMount() {
    const image = this.imageRef.current as HTMLImageElement;

    image.onload = () => {
      const { clientWidth, clientHeight } = this.wrapperRef
        .current as HTMLDivElement;
      const { naturalWidth, naturalHeight } = image;

      const imageRatio = naturalWidth / naturalHeight;
      const wrapperRatio = clientWidth / clientHeight;

      let width: number;
      let height: number;

      if (imageRatio >= wrapperRatio) {
        width = clientWidth;
        height = width / imageRatio;
      } else {
        height = clientHeight;
        width = height * imageRatio;
      }

      this.setState({ imageWidth: width, imageHeight: height });
    };

    this.initZoom();
  }

  initZoom = () => {
    const slider = this.sliderRef.current as HTMLDivElement;
    const factor = 0.1;
    const max_scale = 4;
    const pos = { x: 0, y: 0 };
    const zoom_target = { x: 0, y: 0 };
    const zoom_point = { x: 0, y: 0 };
    let scale = 1;

    slider.style.transformOrigin = '0 0';
    slider.addEventListener('wheel', event => {
      const size = { w: slider.clientWidth, h: slider.clientHeight };
      zoom_point.x = event.pageX - slider.offsetLeft;
      zoom_point.y = event.pageY - slider.offsetTop;

      event.preventDefault();

      let delta = event.deltaY;
      delta = Math.max(-1, Math.min(1, delta));

      // determine the point on where the slide is zoomed in
      zoom_target.x = (zoom_point.x - pos.x) / scale;
      zoom_target.y = (zoom_point.y - pos.y) / scale;

      // apply zoom
      scale += delta * factor * scale;
      scale = Math.max(1, Math.min(max_scale, scale));

      // calculate x and y based on zoom
      pos.x = -zoom_target.x * scale + zoom_point.x;
      pos.y = -zoom_target.y * scale + zoom_point.y;

      // Make sure the slide stays in its container area when zooming out
      if (pos.x > 0) pos.x = 0;
      if (pos.x + size.w * scale < size.w) pos.x = -size.w * (scale - 1);
      if (pos.y > 0) pos.y = 0;
      if (pos.y + size.h * scale < size.h) pos.y = -size.h * (scale - 1);

      slider.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale}, ${scale})`;
    });
  };

  render() {
    const { imageWidth, imageHeight } = this.state;
    return (
      <Wrapper ref={this.wrapperRef}>
        <Container>
          <Slider ref={this.sliderRef}>
            <Image
              width={imageWidth}
              height={imageHeight}
              ref={this.imageRef}
              src="https://picsum.photos/id/1037/1024/768"
              // src="https://picsum.photos/id/1037/800/5000"
              // src="https://picsum.photos/id/1037/800/5000"
            />
          </Slider>
        </Container>
      </Wrapper>
    );
  }
}
