import React from 'react';
import { ZoomableContextType } from 'types';

const zoomableContext = React.createContext<ZoomableContextType | null>(null);

export const ZoomableProvider = zoomableContext.Provider;
export const ZoomableConsumer = zoomableContext.Consumer;

export const withZoomableContext = <C extends React.ElementType>(
  component: C
) => (props: Omit<React.ComponentProps<C>, 'zoomContext'>) => {
  const Component: any = component; // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <ZoomableConsumer>
      {zoomContext => <Component {...props} zoomContext={zoomContext} />}
    </ZoomableConsumer>
  );
};
