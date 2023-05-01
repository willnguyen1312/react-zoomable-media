import React, { useContext, useState } from 'react';
import {
  Zoomable,
  ZoomableImage,
  zoomableContext,
  ZoomableContextType,
} from '../.';

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const zoomImageUrl = `https://picsum.photos/1200/800`;

const Image = () => {
  const { cropImage } = useContext(zoomableContext) as ZoomableContextType;
  const [imageData, serImageData] = useState<string>('');

  const onClickHandler = () => {
    cropImage((imageData: string) => {
      serImageData(imageData);
    });
  };

  const downloadImage = () => {
    const link = document.createElement('a');

    link.setAttribute('href', imageData);
    link.setAttribute('download', 'Cropped Image');
    link.click();
  };

  return (
    <>
      <ZoomableImage imageUrl={zoomImageUrl} />
      <button onClick={onClickHandler}>Crop Image</button>
      {imageData && (
        <>
          <img
            style={{ width: 810, height: 450, objectFit: 'contain' }}
            src={imageData}
          />
          <button onClick={downloadImage}>Download Cropped Image</button>
        </>
      )}
    </>
  );
};

const ImageApp = () => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ width: 810, height: 450, marginBottom: 150 }}>
        <Zoomable
          enable
          maxZoom={4}
          moveStep={50}
          wheelZoomRatio={0.1}
          zoomStep={10}
        >
          <Image />
        </Zoomable>
      </div>
    </div>
  );
};

export default ImageApp;
