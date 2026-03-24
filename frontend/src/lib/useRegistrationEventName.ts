import { useState, useEffect } from "react";
import { events } from "./api";

/**
 * Event title for registration chrome. Uses sessionStorage `eventId` when set, otherwise the first public event.
 */
export function useRegistrationEventName(): string | null {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const storedId = sessionStorage.getItem("eventId");
    events
      .listPublic()
      .then((list: { _id: string; name?: string }[]) => {
        if (!list.length) return;
        const match = storedId ? list.find((e) => e._id === storedId) : undefined;
        const ev = match ?? list[0];
        setName(ev.name ?? null);
      })
      .catch(() => {});
  }, []);

  return name;
}
