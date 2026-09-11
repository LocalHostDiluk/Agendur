import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";
import { notify } from "@/lib/utils/toast";
import { ApiClientError } from "@/lib/query/api-client";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (
            error instanceof ApiClientError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof ApiClientError && error.status >= 500) {
          Sentry.captureException(error, {
            extra: { queryKey: query.queryKey, status: error.status },
          });
        } else if (!(error instanceof ApiClientError)) {
          Sentry.captureException(error, {
            extra: { queryKey: query.queryKey },
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof ApiClientError) {
          if (error.status >= 500) {
            Sentry.captureException(error, {
              extra: { status: error.status, code: error.code },
            });
          }
          notify.error(error.message);
        } else {
          Sentry.captureException(error);
          notify.error("Ha ocurrido un error inesperado.");
        }
      },
    }),
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return createQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = createQueryClient();
    return browserQueryClient;
  }
}
