import React, { FC, useContext } from 'react';

import { ZoomableWrapper } from './ZoomableWrapper';
import { ZoomableContent } from './ZoomableContent';
import { ZoomableContextType, zoomableContext } from './ZoomableContext';

interface ZoomableVideoProps {
  render: (zoomContext: ZoomableContextType) => React.ReactNode;
}

export const ZoomableVideo: FC<ZoomableVideoProps> = ({
  render,
}: ZoomableVideoProps) => {
  const zoomContext = useContext(zoomableContext) as ZoomableContextType;
  return (
    <ZoomableWrapper>
      <ZoomableContent>{render(zoomContext)}</ZoomableContent>
    </ZoomableWrapper>
  );
};
