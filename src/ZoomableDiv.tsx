import React, { FC, useContext } from 'react';

import { ZoomableWrapper } from './ZoomableWrapper';
import { ZoomableContent } from './ZoomableContent';
import { ZoomableContextType, zoomableContext } from './ZoomableContext';

interface ZoomableDivProps {
  render: (zoomContext: ZoomableContextType) => React.ReactNode;
}

export const ZoomableDiv: FC<ZoomableDivProps> = ({
  render,
}: ZoomableDivProps) => {
  const zoomContext = useContext(zoomableContext) as ZoomableContextType;
  return (
    <ZoomableWrapper>
      <ZoomableContent>{render(zoomContext)}</ZoomableContent>
    </ZoomableWrapper>
  );
};
