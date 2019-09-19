import { useRef, useEffect } from 'react';

type EventListenerHandlerType = (event: Event) => void;

// Hook
export function useDocumentEventListener(
  eventName: string,
  handler: EventListenerHandlerType
) {
  const savedHandler = useRef();
  useEffect(() => {
    (savedHandler.current as unknown) = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) =>
      (savedHandler as any).current(event);

    document.addEventListener(eventName, eventListener);

    return () => {
      document.removeEventListener(eventName, eventListener);
    };
  }, [eventName]);
}
