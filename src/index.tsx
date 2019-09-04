import React from 'react';
import styled from 'styled-components';

const Outer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled.div`
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
  margin: auto;
`;

// const Video = styled.video`
//   width: auto;
//   height: auto;
//   max-width: 100%;
// `;

export class Zoomable extends React.Component {
  wrapperRef = React.createRef<HTMLDivElement>();
  sliderRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.initZoom();
  }

  initZoom = () => {
    const wrapper = this.sliderRef.current as HTMLDivElement;
    const slider = this.sliderRef.current as HTMLDivElement;
    const factor = 0.1;
    const max_scale = 4;
    const size = { w: slider.clientWidth, h: slider.clientHeight };
    const pos = { x: 0, y: 0 };
    const zoom_target = { x: 0, y: 0 };
    const zoom_point = { x: 0, y: 0 };
    let scale = 1;

    wrapper.style.transformOrigin = '0 0';
    wrapper.addEventListener('wheel', event => {
      zoom_point.x = event.pageX - wrapper.offsetLeft;
      zoom_point.y = event.pageY - wrapper.offsetTop;

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
    return (
      <Outer>
        <Wrapper ref={this.wrapperRef}>
          <Slider ref={this.sliderRef}>
            <Image src="https://picsum.photos/id/1037/1024/768" />
          </Slider>
        </Wrapper>
      </Outer>
    );
  }
}
