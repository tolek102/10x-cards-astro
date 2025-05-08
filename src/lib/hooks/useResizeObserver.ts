import { useEffect, useRef } from "react";
import debounce from "lodash/debounce";

export const useResizeObserver = (callback: () => void, delay = 100) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const debouncedCallback = debounce(callback, delay);

    observerRef.current = new ResizeObserver(debouncedCallback);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      debouncedCallback.cancel();
    };
  }, [callback, delay]);

  const setElement = (element: HTMLElement | null) => {
    if (element && element !== elementRef.current) {
      elementRef.current = element;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current.observe(element);
      }
    } else if (!element && elementRef.current && observerRef.current) {
      observerRef.current.disconnect();
      elementRef.current = null;
    }
  };

  return setElement;
};
