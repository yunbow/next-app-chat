"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { Channel } from "pusher-js";
import { getPusherClient } from "./client";

/**
 * Pusherチャンネルをsubscribe/unsubscribeするフック
 * Pusherが未設定の場合は何もしない
 */
export function useChannel(
  channelName: string,
  eventName: string,
  callback: (data: unknown) => void
) {
  const channelRef = useRef<Channel | null>(null);
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind(eventName, (data: unknown) => {
      callbackRef.current(data);
    });

    return () => {
      channel.unbind(eventName);
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [channelName, eventName]);
}
