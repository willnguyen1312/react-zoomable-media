import { useRef, useEffect } from 'react';

type EventListenerHandlerType = (event: Event) => void;

export function useEventListener(
  eventName: string,
  handler: EventListenerHandlerType
) {
  const savedHandler = useRef<EventListenerHandlerType>();
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) =>
      (savedHandler as any).current(event);

    window.addEventListener(eventName, eventListener);

    return () => {
      window.removeEventListener(eventName, eventListener);
    };
  }, [eventName]);
}
