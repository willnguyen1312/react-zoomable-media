import React, { useContext, FC, useEffect } from 'react';
import { zoomableContext, ZoomableContextType } from './ZoomableContext';

export const ZoomableWrapper: FC = ({ children }) => {
  const { wrapperRef, id, enableFocus, setWrapperDimensions } = useContext(
    zoomableContext
  ) as ZoomableContextType;

  useEffect(() => {
    setWrapperDimensions();
  }, []);

  return (
    <div
      id={id}
      onPointerDown={enableFocus}
      onPointerEnter={enableFocus}
      tabIndex={0}
      role="button"
      ref={wrapperRef}
      style={{
        zIndex: 9,
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
};
