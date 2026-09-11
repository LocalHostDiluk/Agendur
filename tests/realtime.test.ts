import {
  describe,
  it,
  expect,
  mock,
  spyOn,
  beforeEach,
  afterEach,
} from "bun:test";
import * as Sentry from "@sentry/nextjs";
import { QueryClient } from "@tanstack/react-query";
import * as supabaseClientModule from "@/lib/supabase/client";
import { initCitasRealtimeChannel } from "@/lib/realtime/citas-channel";
import {
  initSlotPresenceChannel,
  type LockedSlot,
} from "@/lib/realtime/presence-channel";

describe("Bloque D: Realtime & Presence con Sentry", () => {
  let sentryMessageSpy: ReturnType<typeof spyOn>;
  let createClientSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    sentryMessageSpy = spyOn(Sentry, "captureMessage").mockImplementation(
      () => "",
    );
  });

  afterEach(() => {
    sentryMessageSpy.mockRestore();
    createClientSpy?.mockRestore();
  });

  describe("D.1: initCitasRealtimeChannel (lib/realtime/citas-channel.ts)", () => {
    it("debería retornar no-op si negocioId es inválido o vacío", () => {
      const queryClient = new QueryClient();
      const resEmpty = initCitasRealtimeChannel("", queryClient);
      expect(resEmpty.channel).toBeNull();
      expect(typeof resEmpty.unsubscribe).toBe("function");
      expect(() => resEmpty.unsubscribe()).not.toThrow();

      const resWhitespace = initCitasRealtimeChannel("   ", queryClient);
      expect(resWhitespace.channel).toBeNull();
    });

    it("debería inicializar el canal con nombre correcto y configurar el listener de postgres_changes", () => {
      let postgresChangesCallback: ((payload: unknown) => void) | null = null;
      let subscribeCallback: ((status: string) => void) | null = null;

      const mockChannel = {
        on: mock(
          (
            event: string,
            filter: unknown,
            callback: (payload: unknown) => void,
          ) => {
            expect(event).toBe("postgres_changes");
            expect(filter).toEqual({
              event: "*",
              schema: "public",
              table: "citas",
              filter: "negocio_id=eq.negocio-456",
            });
            postgresChangesCallback = callback;
            return mockChannel;
          },
        ),
        subscribe: mock((callback: (status: string) => void) => {
          subscribeCallback = callback;
          return mockChannel;
        }),
      };

      const removeChannelMock = mock();
      const mockSupabase = {
        channel: mock((channelName: string) => {
          expect(channelName).toBe("negocio-citas-negocio-456");
          return mockChannel;
        }),
        removeChannel: removeChannelMock,
      };

      createClientSpy = spyOn(
        supabaseClientModule,
        "createClient",
      ).mockReturnValue(mockSupabase as never);

      const queryClient = new QueryClient();
      const invalidateQueriesSpy = spyOn(queryClient, "invalidateQueries");
      const onEventMock = mock();

      const sub = initCitasRealtimeChannel("negocio-456", queryClient, {
        onEvent: onEventMock,
      });

      expect(sub.channel).toBe(mockChannel as never);
      expect(mockSupabase.channel).toHaveBeenCalledWith(
        "negocio-citas-negocio-456",
      );
      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();

      // Simular evento postgres_changes entrante
      expect(postgresChangesCallback).not.toBeNull();
      const mockPayload = {
        eventType: "INSERT",
        new: { id: "cita-1", negocio_id: "negocio-456" },
      };
      postgresChangesCallback!(mockPayload);

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["negocio", "citas"],
      });
      expect(onEventMock).toHaveBeenCalledWith(mockPayload);

      // Simular estados de subscripción y verificación en Sentry
      expect(subscribeCallback).not.toBeNull();
      subscribeCallback!("SUBSCRIBED");
      expect(sentryMessageSpy).not.toHaveBeenCalled();

      subscribeCallback!("CHANNEL_ERROR");
      expect(sentryMessageSpy).toHaveBeenCalledWith(
        "Supabase Realtime Channel Error: CHANNEL_ERROR",
        {
          extra: { negocioId: "negocio-456", status: "CHANNEL_ERROR" },
        },
      );

      sentryMessageSpy.mockClear();
      subscribeCallback!("TIMED_OUT");
      expect(sentryMessageSpy).toHaveBeenCalledWith(
        "Supabase Realtime Channel Error: TIMED_OUT",
        {
          extra: { negocioId: "negocio-456", status: "TIMED_OUT" },
        },
      );

      // Simular unsubscribe
      sub.unsubscribe();
      expect(removeChannelMock).toHaveBeenCalledWith(mockChannel);
    });

    it("debería funcionar correctamente sin callback opcional onEvent", () => {
      let postgresChangesCallback: ((payload: unknown) => void) | null = null;
      const mockChannel = {
        on: mock(
          (
            _event: string,
            _filter: unknown,
            callback: (payload: unknown) => void,
          ) => {
            postgresChangesCallback = callback;
            return mockChannel;
          },
        ),
        subscribe: mock(() => mockChannel),
      };

      const mockSupabase = {
        channel: mock(() => mockChannel),
        removeChannel: mock(),
      };

      createClientSpy = spyOn(
        supabaseClientModule,
        "createClient",
      ).mockReturnValue(mockSupabase as never);

      const queryClient = new QueryClient();
      const invalidateQueriesSpy = spyOn(queryClient, "invalidateQueries");

      initCitasRealtimeChannel("negocio-999", queryClient);

      expect(postgresChangesCallback).not.toBeNull();
      expect(() =>
        postgresChangesCallback!({ eventType: "UPDATE" }),
      ).not.toThrow();
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["negocio", "citas"],
      });
    });
  });

  describe("D.2: initSlotPresenceChannel (lib/realtime/presence-channel.ts)", () => {
    it("debería retornar no-op helpers si faltan parámetros requeridos", async () => {
      const res = initSlotPresenceChannel({
        sucursalId: "",
        fecha: "2026-09-15",
        clientId: "client-1",
        onSync: mock(),
      });

      expect(res.channel).toBeNull();
      await expect(res.lockSlot("10:00")).resolves.toBeUndefined();
      await expect(res.releaseSlot()).resolves.toBeUndefined();
      expect(() => res.unsubscribe()).not.toThrow();
    });

    it("debería inicializar canal presence, trackear slot, untrackear y reportar sync excluyendo clientId propio", async () => {
      let presenceSyncCallback: (() => void) | null = null;
      let subscribeCallback: ((status: string) => void) | null = null;

      const trackMock = mock(() => Promise.resolve("ok"));
      const untrackMock = mock(() => Promise.resolve("ok"));
      const presenceStateMock = mock(() => ({
        "client-1": [
          {
            presence_ref: "ref1",
            slot: "09:00",
            clientId: "client-1",
            timestamp: 1000,
          },
        ],
        "client-2": [
          {
            presence_ref: "ref2",
            slot: "10:00",
            clientId: "client-2",
            timestamp: 2000,
          },
        ],
        "client-3": [
          {
            presence_ref: "ref3",
            slot: "11:30",
            clientId: "client-3",
            timestamp: 3000,
          },
        ],
      }));

      const mockChannel = {
        on: mock((type: string, filter: unknown, callback: () => void) => {
          expect(type).toBe("presence");
          expect(filter).toEqual({ event: "sync" });
          presenceSyncCallback = callback;
          return mockChannel;
        }),
        subscribe: mock((callback: (status: string) => void) => {
          subscribeCallback = callback;
          return mockChannel;
        }),
        presenceState: presenceStateMock,
        track: trackMock,
        untrack: untrackMock,
      };

      const removeChannelMock = mock();
      const mockSupabase = {
        channel: mock((channelName: string, options: unknown) => {
          expect(channelName).toBe("slots-sucursal-1-2026-09-15");
          expect(options).toEqual({
            config: {
              presence: {
                key: "client-1",
              },
            },
          });
          return mockChannel;
        }),
        removeChannel: removeChannelMock,
      };

      createClientSpy = spyOn(
        supabaseClientModule,
        "createClient",
      ).mockReturnValue(mockSupabase as never);

      const onSyncMock = mock();

      const sub = initSlotPresenceChannel({
        sucursalId: "sucursal-1",
        fecha: "2026-09-15",
        clientId: "client-1",
        onSync: onSyncMock,
      });

      expect(sub.channel).toBe(mockChannel as never);
      expect(mockSupabase.channel).toHaveBeenCalled();
      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();

      // Simular sincronización de presence
      expect(presenceSyncCallback).not.toBeNull();
      presenceSyncCallback!();

      // onSync debe recibir slots de client-2 y client-3 pero NO de client-1
      expect(onSyncMock).toHaveBeenCalledTimes(1);
      const syncedSlots = onSyncMock.mock.calls[0][0] as LockedSlot[];
      expect(syncedSlots).toHaveLength(2);
      expect(syncedSlots).toEqual([
        { slot: "10:00", clientId: "client-2", timestamp: 2000 },
        { slot: "11:30", clientId: "client-3", timestamp: 3000 },
      ]);

      // Probar lockSlot
      const before = Date.now();
      await sub.lockSlot("15:00");
      const after = Date.now();
      expect(trackMock).toHaveBeenCalledTimes(1);
      const trackPayload = (trackMock.mock.calls as unknown[][])[0][0] as {
        slot: string;
        clientId: string;
        timestamp: number;
      };
      expect(trackPayload.slot).toBe("15:00");
      expect(trackPayload.clientId).toBe("client-1");
      expect(trackPayload.timestamp).toBeGreaterThanOrEqual(before);
      expect(trackPayload.timestamp).toBeLessThanOrEqual(after);

      // Probar releaseSlot
      await sub.releaseSlot();
      expect(untrackMock).toHaveBeenCalledTimes(1);

      // Probar Sentry con CHANNEL_ERROR y TIMED_OUT
      expect(subscribeCallback).not.toBeNull();
      subscribeCallback!("SUBSCRIBED");
      expect(sentryMessageSpy).not.toHaveBeenCalled();

      subscribeCallback!("CHANNEL_ERROR");
      expect(sentryMessageSpy).toHaveBeenCalledWith(
        "Supabase Realtime Channel Error: CHANNEL_ERROR",
        {
          extra: {
            sucursalId: "sucursal-1",
            fecha: "2026-09-15",
            clientId: "client-1",
            status: "CHANNEL_ERROR",
          },
        },
      );

      sentryMessageSpy.mockClear();
      subscribeCallback!("TIMED_OUT");
      expect(sentryMessageSpy).toHaveBeenCalledWith(
        "Supabase Realtime Channel Error: TIMED_OUT",
        {
          extra: {
            sucursalId: "sucursal-1",
            fecha: "2026-09-15",
            clientId: "client-1",
            status: "TIMED_OUT",
          },
        },
      );

      // Probar cleanup de unsubscribe
      sub.unsubscribe();
      expect(removeChannelMock).toHaveBeenCalledWith(mockChannel);
    });

    it("debería omitir presencias que no tengan definido el campo slot", () => {
      const presenceStateMock = mock(() => ({
        "client-other": [
          {
            presence_ref: "ref1",
            clientId: "client-other",
            timestamp: 1000,
            // sin campo slot
          },
          {
            presence_ref: "ref2",
            slot: "14:00",
            clientId: "client-other",
            timestamp: 2000,
          },
        ],
      }));

      const mockChannel = {
        on: mock((_type: string, _filter: unknown, callback: () => void) => {
          callback();
          return mockChannel;
        }),
        subscribe: mock(() => mockChannel),
        presenceState: presenceStateMock,
        track: mock(() => Promise.resolve("ok")),
        untrack: mock(() => Promise.resolve("ok")),
      };

      createClientSpy = spyOn(
        supabaseClientModule,
        "createClient",
      ).mockReturnValue({
        channel: mock(() => mockChannel),
        removeChannel: mock(),
      } as never);

      const onSyncMock = mock();
      initSlotPresenceChannel({
        sucursalId: "suc-1",
        fecha: "2026-09-15",
        clientId: "client-me",
        onSync: onSyncMock,
      });

      expect(onSyncMock).toHaveBeenCalledWith([
        { slot: "14:00", clientId: "client-other", timestamp: 2000 },
      ]);
    });
  });
});
