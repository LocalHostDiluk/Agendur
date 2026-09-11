import type { RealtimeChannel } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/client";

export interface LockedSlot {
  slot: string;
  clientId: string;
  timestamp: number;
}

export interface SlotPresenceParams {
  sucursalId: string;
  fecha: string;
  clientId: string;
  onSync: (lockedSlots: LockedSlot[]) => void;
}

export interface SlotPresenceSubscription {
  channel: RealtimeChannel | null;
  lockSlot: (slot: string) => Promise<void>;
  releaseSlot: () => Promise<void>;
  unsubscribe: () => void;
}

export function initSlotPresenceChannel(
  params: SlotPresenceParams,
): SlotPresenceSubscription {
  if (
    !params?.sucursalId?.trim() ||
    !params?.fecha?.trim() ||
    !params?.clientId?.trim()
  ) {
    return {
      channel: null,
      lockSlot: async () => {},
      releaseSlot: async () => {},
      unsubscribe: () => {},
    };
  }

  const supabase = createClient();
  const channel = supabase.channel(
    `slots-${params.sucursalId}-${params.fecha}`,
    {
      config: {
        presence: {
          key: params.clientId,
        },
      },
    },
  );

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<LockedSlot>();
      const lockedSlots: LockedSlot[] = [];

      for (const [key, presences] of Object.entries(state)) {
        if (key === params.clientId) continue;

        for (const presence of presences) {
          if (presence.clientId === params.clientId) continue;
          if (presence.slot) {
            lockedSlots.push({
              slot: presence.slot,
              clientId: presence.clientId || key,
              timestamp: presence.timestamp ?? Date.now(),
            });
          }
        }
      }

      params.onSync(lockedSlots);
    })
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        Sentry.captureMessage(`Supabase Realtime Channel Error: ${status}`, {
          extra: {
            sucursalId: params.sucursalId,
            fecha: params.fecha,
            clientId: params.clientId,
            status,
          },
        });
      }
    });

  return {
    channel,
    lockSlot: async (slot: string) => {
      await channel.track({
        slot,
        clientId: params.clientId,
        timestamp: Date.now(),
      });
    },
    releaseSlot: async () => {
      await channel.untrack();
    },
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
