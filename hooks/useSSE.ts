import { useEffect, useRef } from 'react';

interface UseSSEOptions {
  url: string;
  onMessage?: (event: MessageEvent) => void;
  events?: {
    [key: string]: (data: any) => void;
  };
}

export const useSSE = ({ url, onMessage, events }: UseSSEOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;
    console.log(`📡 SSE: Attempting connection to: ${url}`);
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('📡 SSE Connection opened');
    };

    eventSource.onerror = (error) => {
      // EventSource error event doesn't contain much info, but we can check readyState
      const target = error.target as EventSource;
      console.error('📡 SSE Error - ReadyState:', target.readyState);
      // readyState 2 means the connection is closed and won't reconnect
      // readyState 0 means it's connecting/reconnecting
    };

    if (onMessage) {
      eventSource.onmessage = onMessage;
    }

    // Register specific event listeners
    if (events) {
      Object.entries(events).forEach(([eventName, callback]) => {
        eventSource.addEventListener(eventName, (event: any) => {
          try {
            const data = JSON.parse(event.data);
            callback(data);
          } catch (e) {
            console.error(`📡 Error parsing SSE data for event ${eventName}:`, e);
          }
        });
      });
    }

    return () => {
      console.log('📡 Closing SSE connection');
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [url]); // Only reconnect if URL changes

  return eventSourceRef.current;
};
