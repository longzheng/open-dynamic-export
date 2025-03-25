import client from "../client.ts";
import { useQuery, queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import type { SunspecDataQueryResponse, SiteRealPowerQueryResponse, DerRealPowerQueryResponse, LoadRealPowerQueryResponse, ExportLimitQueryResponse, GenerationLimitQueryResponse, ImportLimitQueryResponse, LoadLimitQueryResponse, ConnectionQueryResponse, EnergizeQueryResponse, CsipAusStatusQueryResponse, ExportLimitScheduleQueryResponse, GenerationLimitScheduleQueryResponse, ImportLimitScheduleQueryResponse, LoadLimitScheduleQueryResponse, ConnectionScheduleQueryResponse, EnergizeScheduleQueryResponse, CoordinatorStartMutationResponse, CoordinatorStatusQueryResponse, CoordinatorStopMutationResponse } from "./types";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult, UseMutationOptions } from "@tanstack/react-query";

 type SunspecDataClient = typeof client<SunspecDataQueryResponse, Error, never>;
type SunspecData = {
    data: SunspecDataQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<SunspecDataClient>>;
    client: {
        parameters: Partial<Parameters<SunspecDataClient>[0]>;
        return: Awaited<ReturnType<SunspecDataClient>>;
    };
};
export const sunspecDataQueryKey = () => [{ url: "/api/sunspec/data" }] as const;
export type SunspecDataQueryKey = ReturnType<typeof sunspecDataQueryKey>;
export function sunspecDataQueryOptions(options: SunspecData["client"]["parameters"] = {}) {
    const queryKey = sunspecDataQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<SunspecData["data"], SunspecData["error"]>({
                method: "get",
                url: `/api/sunspec/data`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/sunspec/data
 */
export function useSunspecData<TData = SunspecData["response"], TQueryData = SunspecData["response"], TQueryKey extends QueryKey = SunspecDataQueryKey>(options: {
    query?: Partial<QueryObserverOptions<SunspecData["response"], SunspecData["error"], TData, TQueryData, TQueryKey>>;
    client?: SunspecData["client"]["parameters"];
} = {}): UseQueryResult<TData, SunspecData["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? sunspecDataQueryKey();
    const query = useQuery({
        ...sunspecDataQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, SunspecData["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const sunspecDataSuspenseQueryKey = () => [{ url: "/api/sunspec/data" }] as const;
export type SunspecDataSuspenseQueryKey = ReturnType<typeof sunspecDataSuspenseQueryKey>;
export function sunspecDataSuspenseQueryOptions(options: SunspecData["client"]["parameters"] = {}) {
    const queryKey = sunspecDataSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<SunspecData["data"], SunspecData["error"]>({
                method: "get",
                url: `/api/sunspec/data`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/sunspec/data
 */
export function useSunspecDataSuspense<TData = SunspecData["response"], TQueryKey extends QueryKey = SunspecDataSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<SunspecData["response"], SunspecData["error"], TData, TQueryKey>>;
    client?: SunspecData["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, SunspecData["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? sunspecDataSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...sunspecDataSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, SunspecData["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type SiteRealPowerClient = typeof client<SiteRealPowerQueryResponse, Error, never>;
type SiteRealPower = {
    data: SiteRealPowerQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<SiteRealPowerClient>>;
    client: {
        parameters: Partial<Parameters<SiteRealPowerClient>[0]>;
        return: Awaited<ReturnType<SiteRealPowerClient>>;
    };
};
export const siteRealPowerQueryKey = () => [{ url: "/api/data/siteRealPower" }] as const;
export type SiteRealPowerQueryKey = ReturnType<typeof siteRealPowerQueryKey>;
export function siteRealPowerQueryOptions(options: SiteRealPower["client"]["parameters"] = {}) {
    const queryKey = siteRealPowerQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<SiteRealPower["data"], SiteRealPower["error"]>({
                method: "get",
                url: `/api/data/siteRealPower`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/siteRealPower
 */
export function useSiteRealPower<TData = SiteRealPower["response"], TQueryData = SiteRealPower["response"], TQueryKey extends QueryKey = SiteRealPowerQueryKey>(options: {
    query?: Partial<QueryObserverOptions<SiteRealPower["response"], SiteRealPower["error"], TData, TQueryData, TQueryKey>>;
    client?: SiteRealPower["client"]["parameters"];
} = {}): UseQueryResult<TData, SiteRealPower["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? siteRealPowerQueryKey();
    const query = useQuery({
        ...siteRealPowerQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, SiteRealPower["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const siteRealPowerSuspenseQueryKey = () => [{ url: "/api/data/siteRealPower" }] as const;
export type SiteRealPowerSuspenseQueryKey = ReturnType<typeof siteRealPowerSuspenseQueryKey>;
export function siteRealPowerSuspenseQueryOptions(options: SiteRealPower["client"]["parameters"] = {}) {
    const queryKey = siteRealPowerSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<SiteRealPower["data"], SiteRealPower["error"]>({
                method: "get",
                url: `/api/data/siteRealPower`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/siteRealPower
 */
export function useSiteRealPowerSuspense<TData = SiteRealPower["response"], TQueryKey extends QueryKey = SiteRealPowerSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<SiteRealPower["response"], SiteRealPower["error"], TData, TQueryKey>>;
    client?: SiteRealPower["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, SiteRealPower["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? siteRealPowerSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...siteRealPowerSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, SiteRealPower["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type DerRealPowerClient = typeof client<DerRealPowerQueryResponse, Error, never>;
type DerRealPower = {
    data: DerRealPowerQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<DerRealPowerClient>>;
    client: {
        parameters: Partial<Parameters<DerRealPowerClient>[0]>;
        return: Awaited<ReturnType<DerRealPowerClient>>;
    };
};
export const derRealPowerQueryKey = () => [{ url: "/api/data/derRealPower" }] as const;
export type DerRealPowerQueryKey = ReturnType<typeof derRealPowerQueryKey>;
export function derRealPowerQueryOptions(options: DerRealPower["client"]["parameters"] = {}) {
    const queryKey = derRealPowerQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<DerRealPower["data"], DerRealPower["error"]>({
                method: "get",
                url: `/api/data/derRealPower`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/derRealPower
 */
export function useDerRealPower<TData = DerRealPower["response"], TQueryData = DerRealPower["response"], TQueryKey extends QueryKey = DerRealPowerQueryKey>(options: {
    query?: Partial<QueryObserverOptions<DerRealPower["response"], DerRealPower["error"], TData, TQueryData, TQueryKey>>;
    client?: DerRealPower["client"]["parameters"];
} = {}): UseQueryResult<TData, DerRealPower["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? derRealPowerQueryKey();
    const query = useQuery({
        ...derRealPowerQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, DerRealPower["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const derRealPowerSuspenseQueryKey = () => [{ url: "/api/data/derRealPower" }] as const;
export type DerRealPowerSuspenseQueryKey = ReturnType<typeof derRealPowerSuspenseQueryKey>;
export function derRealPowerSuspenseQueryOptions(options: DerRealPower["client"]["parameters"] = {}) {
    const queryKey = derRealPowerSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<DerRealPower["data"], DerRealPower["error"]>({
                method: "get",
                url: `/api/data/derRealPower`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/derRealPower
 */
export function useDerRealPowerSuspense<TData = DerRealPower["response"], TQueryKey extends QueryKey = DerRealPowerSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<DerRealPower["response"], DerRealPower["error"], TData, TQueryKey>>;
    client?: DerRealPower["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, DerRealPower["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? derRealPowerSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...derRealPowerSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, DerRealPower["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type LoadRealPowerClient = typeof client<LoadRealPowerQueryResponse, Error, never>;
type LoadRealPower = {
    data: LoadRealPowerQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<LoadRealPowerClient>>;
    client: {
        parameters: Partial<Parameters<LoadRealPowerClient>[0]>;
        return: Awaited<ReturnType<LoadRealPowerClient>>;
    };
};
export const loadRealPowerQueryKey = () => [{ url: "/api/data/loadRealPower" }] as const;
export type LoadRealPowerQueryKey = ReturnType<typeof loadRealPowerQueryKey>;
export function loadRealPowerQueryOptions(options: LoadRealPower["client"]["parameters"] = {}) {
    const queryKey = loadRealPowerQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<LoadRealPower["data"], LoadRealPower["error"]>({
                method: "get",
                url: `/api/data/loadRealPower`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/loadRealPower
 */
export function useLoadRealPower<TData = LoadRealPower["response"], TQueryData = LoadRealPower["response"], TQueryKey extends QueryKey = LoadRealPowerQueryKey>(options: {
    query?: Partial<QueryObserverOptions<LoadRealPower["response"], LoadRealPower["error"], TData, TQueryData, TQueryKey>>;
    client?: LoadRealPower["client"]["parameters"];
} = {}): UseQueryResult<TData, LoadRealPower["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? loadRealPowerQueryKey();
    const query = useQuery({
        ...loadRealPowerQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, LoadRealPower["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const loadRealPowerSuspenseQueryKey = () => [{ url: "/api/data/loadRealPower" }] as const;
export type LoadRealPowerSuspenseQueryKey = ReturnType<typeof loadRealPowerSuspenseQueryKey>;
export function loadRealPowerSuspenseQueryOptions(options: LoadRealPower["client"]["parameters"] = {}) {
    const queryKey = loadRealPowerSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<LoadRealPower["data"], LoadRealPower["error"]>({
                method: "get",
                url: `/api/data/loadRealPower`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/loadRealPower
 */
export function useLoadRealPowerSuspense<TData = LoadRealPower["response"], TQueryKey extends QueryKey = LoadRealPowerSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<LoadRealPower["response"], LoadRealPower["error"], TData, TQueryKey>>;
    client?: LoadRealPower["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, LoadRealPower["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? loadRealPowerSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...loadRealPowerSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, LoadRealPower["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type ExportLimitClient = typeof client<ExportLimitQueryResponse, Error, never>;
type ExportLimit = {
    data: ExportLimitQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<ExportLimitClient>>;
    client: {
        parameters: Partial<Parameters<ExportLimitClient>[0]>;
        return: Awaited<ReturnType<ExportLimitClient>>;
    };
};
export const exportLimitQueryKey = () => [{ url: "/api/data/exportLimit" }] as const;
export type ExportLimitQueryKey = ReturnType<typeof exportLimitQueryKey>;
export function exportLimitQueryOptions(options: ExportLimit["client"]["parameters"] = {}) {
    const queryKey = exportLimitQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ExportLimit["data"], ExportLimit["error"]>({
                method: "get",
                url: `/api/data/exportLimit`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/exportLimit
 */
export function useExportLimit<TData = ExportLimit["response"], TQueryData = ExportLimit["response"], TQueryKey extends QueryKey = ExportLimitQueryKey>(options: {
    query?: Partial<QueryObserverOptions<ExportLimit["response"], ExportLimit["error"], TData, TQueryData, TQueryKey>>;
    client?: ExportLimit["client"]["parameters"];
} = {}): UseQueryResult<TData, ExportLimit["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? exportLimitQueryKey();
    const query = useQuery({
        ...exportLimitQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, ExportLimit["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const exportLimitSuspenseQueryKey = () => [{ url: "/api/data/exportLimit" }] as const;
export type ExportLimitSuspenseQueryKey = ReturnType<typeof exportLimitSuspenseQueryKey>;
export function exportLimitSuspenseQueryOptions(options: ExportLimit["client"]["parameters"] = {}) {
    const queryKey = exportLimitSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ExportLimit["data"], ExportLimit["error"]>({
                method: "get",
                url: `/api/data/exportLimit`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/exportLimit
 */
export function useExportLimitSuspense<TData = ExportLimit["response"], TQueryKey extends QueryKey = ExportLimitSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<ExportLimit["response"], ExportLimit["error"], TData, TQueryKey>>;
    client?: ExportLimit["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, ExportLimit["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? exportLimitSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...exportLimitSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, ExportLimit["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type GenerationLimitClient = typeof client<GenerationLimitQueryResponse, Error, never>;
type GenerationLimit = {
    data: GenerationLimitQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<GenerationLimitClient>>;
    client: {
        parameters: Partial<Parameters<GenerationLimitClient>[0]>;
        return: Awaited<ReturnType<GenerationLimitClient>>;
    };
};
export const generationLimitQueryKey = () => [{ url: "/api/data/generationLimit" }] as const;
export type GenerationLimitQueryKey = ReturnType<typeof generationLimitQueryKey>;
export function generationLimitQueryOptions(options: GenerationLimit["client"]["parameters"] = {}) {
    const queryKey = generationLimitQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GenerationLimit["data"], GenerationLimit["error"]>({
                method: "get",
                url: `/api/data/generationLimit`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/generationLimit
 */
export function useGenerationLimit<TData = GenerationLimit["response"], TQueryData = GenerationLimit["response"], TQueryKey extends QueryKey = GenerationLimitQueryKey>(options: {
    query?: Partial<QueryObserverOptions<GenerationLimit["response"], GenerationLimit["error"], TData, TQueryData, TQueryKey>>;
    client?: GenerationLimit["client"]["parameters"];
} = {}): UseQueryResult<TData, GenerationLimit["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? generationLimitQueryKey();
    const query = useQuery({
        ...generationLimitQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, GenerationLimit["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const generationLimitSuspenseQueryKey = () => [{ url: "/api/data/generationLimit" }] as const;
export type GenerationLimitSuspenseQueryKey = ReturnType<typeof generationLimitSuspenseQueryKey>;
export function generationLimitSuspenseQueryOptions(options: GenerationLimit["client"]["parameters"] = {}) {
    const queryKey = generationLimitSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GenerationLimit["data"], GenerationLimit["error"]>({
                method: "get",
                url: `/api/data/generationLimit`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/generationLimit
 */
export function useGenerationLimitSuspense<TData = GenerationLimit["response"], TQueryKey extends QueryKey = GenerationLimitSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<GenerationLimit["response"], GenerationLimit["error"], TData, TQueryKey>>;
    client?: GenerationLimit["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, GenerationLimit["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? generationLimitSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...generationLimitSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, GenerationLimit["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type ImportLimitClient = typeof client<ImportLimitQueryResponse, Error, never>;
type ImportLimit = {
    data: ImportLimitQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<ImportLimitClient>>;
    client: {
        parameters: Partial<Parameters<ImportLimitClient>[0]>;
        return: Awaited<ReturnType<ImportLimitClient>>;
    };
};
export const importLimitQueryKey = () => [{ url: "/api/data/importLimit" }] as const;
export type ImportLimitQueryKey = ReturnType<typeof importLimitQueryKey>;
export function importLimitQueryOptions(options: ImportLimit["client"]["parameters"] = {}) {
    const queryKey = importLimitQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ImportLimit["data"], ImportLimit["error"]>({
                method: "get",
                url: `/api/data/importLimit`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/importLimit
 */
export function useImportLimit<TData = ImportLimit["response"], TQueryData = ImportLimit["response"], TQueryKey extends QueryKey = ImportLimitQueryKey>(options: {
    query?: Partial<QueryObserverOptions<ImportLimit["response"], ImportLimit["error"], TData, TQueryData, TQueryKey>>;
    client?: ImportLimit["client"]["parameters"];
} = {}): UseQueryResult<TData, ImportLimit["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? importLimitQueryKey();
    const query = useQuery({
        ...importLimitQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, ImportLimit["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const importLimitSuspenseQueryKey = () => [{ url: "/api/data/importLimit" }] as const;
export type ImportLimitSuspenseQueryKey = ReturnType<typeof importLimitSuspenseQueryKey>;
export function importLimitSuspenseQueryOptions(options: ImportLimit["client"]["parameters"] = {}) {
    const queryKey = importLimitSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ImportLimit["data"], ImportLimit["error"]>({
                method: "get",
                url: `/api/data/importLimit`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/importLimit
 */
export function useImportLimitSuspense<TData = ImportLimit["response"], TQueryKey extends QueryKey = ImportLimitSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<ImportLimit["response"], ImportLimit["error"], TData, TQueryKey>>;
    client?: ImportLimit["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, ImportLimit["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? importLimitSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...importLimitSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, ImportLimit["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type LoadLimitClient = typeof client<LoadLimitQueryResponse, Error, never>;
type LoadLimit = {
    data: LoadLimitQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<LoadLimitClient>>;
    client: {
        parameters: Partial<Parameters<LoadLimitClient>[0]>;
        return: Awaited<ReturnType<LoadLimitClient>>;
    };
};
export const loadLimitQueryKey = () => [{ url: "/api/data/loadLimit" }] as const;
export type LoadLimitQueryKey = ReturnType<typeof loadLimitQueryKey>;
export function loadLimitQueryOptions(options: LoadLimit["client"]["parameters"] = {}) {
    const queryKey = loadLimitQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<LoadLimit["data"], LoadLimit["error"]>({
                method: "get",
                url: `/api/data/loadLimit`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/loadLimit
 */
export function useLoadLimit<TData = LoadLimit["response"], TQueryData = LoadLimit["response"], TQueryKey extends QueryKey = LoadLimitQueryKey>(options: {
    query?: Partial<QueryObserverOptions<LoadLimit["response"], LoadLimit["error"], TData, TQueryData, TQueryKey>>;
    client?: LoadLimit["client"]["parameters"];
} = {}): UseQueryResult<TData, LoadLimit["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? loadLimitQueryKey();
    const query = useQuery({
        ...loadLimitQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, LoadLimit["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const loadLimitSuspenseQueryKey = () => [{ url: "/api/data/loadLimit" }] as const;
export type LoadLimitSuspenseQueryKey = ReturnType<typeof loadLimitSuspenseQueryKey>;
export function loadLimitSuspenseQueryOptions(options: LoadLimit["client"]["parameters"] = {}) {
    const queryKey = loadLimitSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<LoadLimit["data"], LoadLimit["error"]>({
                method: "get",
                url: `/api/data/loadLimit`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/loadLimit
 */
export function useLoadLimitSuspense<TData = LoadLimit["response"], TQueryKey extends QueryKey = LoadLimitSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<LoadLimit["response"], LoadLimit["error"], TData, TQueryKey>>;
    client?: LoadLimit["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, LoadLimit["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? loadLimitSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...loadLimitSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, LoadLimit["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type ConnectionClient = typeof client<ConnectionQueryResponse, Error, never>;
type Connection = {
    data: ConnectionQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<ConnectionClient>>;
    client: {
        parameters: Partial<Parameters<ConnectionClient>[0]>;
        return: Awaited<ReturnType<ConnectionClient>>;
    };
};
export const connectionQueryKey = () => [{ url: "/api/data/connection" }] as const;
export type ConnectionQueryKey = ReturnType<typeof connectionQueryKey>;
export function connectionQueryOptions(options: Connection["client"]["parameters"] = {}) {
    const queryKey = connectionQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<Connection["data"], Connection["error"]>({
                method: "get",
                url: `/api/data/connection`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/connection
 */
export function useConnection<TData = Connection["response"], TQueryData = Connection["response"], TQueryKey extends QueryKey = ConnectionQueryKey>(options: {
    query?: Partial<QueryObserverOptions<Connection["response"], Connection["error"], TData, TQueryData, TQueryKey>>;
    client?: Connection["client"]["parameters"];
} = {}): UseQueryResult<TData, Connection["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? connectionQueryKey();
    const query = useQuery({
        ...connectionQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, Connection["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const connectionSuspenseQueryKey = () => [{ url: "/api/data/connection" }] as const;
export type ConnectionSuspenseQueryKey = ReturnType<typeof connectionSuspenseQueryKey>;
export function connectionSuspenseQueryOptions(options: Connection["client"]["parameters"] = {}) {
    const queryKey = connectionSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<Connection["data"], Connection["error"]>({
                method: "get",
                url: `/api/data/connection`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/connection
 */
export function useConnectionSuspense<TData = Connection["response"], TQueryKey extends QueryKey = ConnectionSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<Connection["response"], Connection["error"], TData, TQueryKey>>;
    client?: Connection["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, Connection["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? connectionSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...connectionSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, Connection["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type EnergizeClient = typeof client<EnergizeQueryResponse, Error, never>;
type Energize = {
    data: EnergizeQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<EnergizeClient>>;
    client: {
        parameters: Partial<Parameters<EnergizeClient>[0]>;
        return: Awaited<ReturnType<EnergizeClient>>;
    };
};
export const energizeQueryKey = () => [{ url: "/api/data/energize" }] as const;
export type EnergizeQueryKey = ReturnType<typeof energizeQueryKey>;
export function energizeQueryOptions(options: Energize["client"]["parameters"] = {}) {
    const queryKey = energizeQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<Energize["data"], Energize["error"]>({
                method: "get",
                url: `/api/data/energize`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/energize
 */
export function useEnergize<TData = Energize["response"], TQueryData = Energize["response"], TQueryKey extends QueryKey = EnergizeQueryKey>(options: {
    query?: Partial<QueryObserverOptions<Energize["response"], Energize["error"], TData, TQueryData, TQueryKey>>;
    client?: Energize["client"]["parameters"];
} = {}): UseQueryResult<TData, Energize["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? energizeQueryKey();
    const query = useQuery({
        ...energizeQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, Energize["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const energizeSuspenseQueryKey = () => [{ url: "/api/data/energize" }] as const;
export type EnergizeSuspenseQueryKey = ReturnType<typeof energizeSuspenseQueryKey>;
export function energizeSuspenseQueryOptions(options: Energize["client"]["parameters"] = {}) {
    const queryKey = energizeSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<Energize["data"], Energize["error"]>({
                method: "get",
                url: `/api/data/energize`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/data/energize
 */
export function useEnergizeSuspense<TData = Energize["response"], TQueryKey extends QueryKey = EnergizeSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<Energize["response"], Energize["error"], TData, TQueryKey>>;
    client?: Energize["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, Energize["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? energizeSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...energizeSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, Energize["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type CsipAusStatusClient = typeof client<CsipAusStatusQueryResponse, Error, never>;
type CsipAusStatus = {
    data: CsipAusStatusQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<CsipAusStatusClient>>;
    client: {
        parameters: Partial<Parameters<CsipAusStatusClient>[0]>;
        return: Awaited<ReturnType<CsipAusStatusClient>>;
    };
};
export const csipAusStatusQueryKey = () => [{ url: "/api/csipAus/id" }] as const;
export type CsipAusStatusQueryKey = ReturnType<typeof csipAusStatusQueryKey>;
export function csipAusStatusQueryOptions(options: CsipAusStatus["client"]["parameters"] = {}) {
    const queryKey = csipAusStatusQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<CsipAusStatus["data"], CsipAusStatus["error"]>({
                method: "get",
                url: `/api/csipAus/id`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @description Get CSIP-AUS device certificate LFID and SFDI
 * @link /api/csipAus/id
 */
export function useCsipAusStatus<TData = CsipAusStatus["response"], TQueryData = CsipAusStatus["response"], TQueryKey extends QueryKey = CsipAusStatusQueryKey>(options: {
    query?: Partial<QueryObserverOptions<CsipAusStatus["response"], CsipAusStatus["error"], TData, TQueryData, TQueryKey>>;
    client?: CsipAusStatus["client"]["parameters"];
} = {}): UseQueryResult<TData, CsipAusStatus["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? csipAusStatusQueryKey();
    const query = useQuery({
        ...csipAusStatusQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, CsipAusStatus["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const csipAusStatusSuspenseQueryKey = () => [{ url: "/api/csipAus/id" }] as const;
export type CsipAusStatusSuspenseQueryKey = ReturnType<typeof csipAusStatusSuspenseQueryKey>;
export function csipAusStatusSuspenseQueryOptions(options: CsipAusStatus["client"]["parameters"] = {}) {
    const queryKey = csipAusStatusSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<CsipAusStatus["data"], CsipAusStatus["error"]>({
                method: "get",
                url: `/api/csipAus/id`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @description Get CSIP-AUS device certificate LFID and SFDI
 * @link /api/csipAus/id
 */
export function useCsipAusStatusSuspense<TData = CsipAusStatus["response"], TQueryKey extends QueryKey = CsipAusStatusSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<CsipAusStatus["response"], CsipAusStatus["error"], TData, TQueryKey>>;
    client?: CsipAusStatus["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, CsipAusStatus["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? csipAusStatusSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...csipAusStatusSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, CsipAusStatus["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type ExportLimitScheduleClient = typeof client<ExportLimitScheduleQueryResponse, Error, never>;
type ExportLimitSchedule = {
    data: ExportLimitScheduleQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<ExportLimitScheduleClient>>;
    client: {
        parameters: Partial<Parameters<ExportLimitScheduleClient>[0]>;
        return: Awaited<ReturnType<ExportLimitScheduleClient>>;
    };
};
export const exportLimitScheduleQueryKey = () => [{ url: "/api/csipAus/exportLimitSchedule" }] as const;
export type ExportLimitScheduleQueryKey = ReturnType<typeof exportLimitScheduleQueryKey>;
export function exportLimitScheduleQueryOptions(options: ExportLimitSchedule["client"]["parameters"] = {}) {
    const queryKey = exportLimitScheduleQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ExportLimitSchedule["data"], ExportLimitSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/exportLimitSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/exportLimitSchedule
 */
export function useExportLimitSchedule<TData = ExportLimitSchedule["response"], TQueryData = ExportLimitSchedule["response"], TQueryKey extends QueryKey = ExportLimitScheduleQueryKey>(options: {
    query?: Partial<QueryObserverOptions<ExportLimitSchedule["response"], ExportLimitSchedule["error"], TData, TQueryData, TQueryKey>>;
    client?: ExportLimitSchedule["client"]["parameters"];
} = {}): UseQueryResult<TData, ExportLimitSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? exportLimitScheduleQueryKey();
    const query = useQuery({
        ...exportLimitScheduleQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, ExportLimitSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const exportLimitScheduleSuspenseQueryKey = () => [{ url: "/api/csipAus/exportLimitSchedule" }] as const;
export type ExportLimitScheduleSuspenseQueryKey = ReturnType<typeof exportLimitScheduleSuspenseQueryKey>;
export function exportLimitScheduleSuspenseQueryOptions(options: ExportLimitSchedule["client"]["parameters"] = {}) {
    const queryKey = exportLimitScheduleSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ExportLimitSchedule["data"], ExportLimitSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/exportLimitSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/exportLimitSchedule
 */
export function useExportLimitScheduleSuspense<TData = ExportLimitSchedule["response"], TQueryKey extends QueryKey = ExportLimitScheduleSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<ExportLimitSchedule["response"], ExportLimitSchedule["error"], TData, TQueryKey>>;
    client?: ExportLimitSchedule["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, ExportLimitSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? exportLimitScheduleSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...exportLimitScheduleSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, ExportLimitSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type GenerationLimitScheduleClient = typeof client<GenerationLimitScheduleQueryResponse, Error, never>;
type GenerationLimitSchedule = {
    data: GenerationLimitScheduleQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<GenerationLimitScheduleClient>>;
    client: {
        parameters: Partial<Parameters<GenerationLimitScheduleClient>[0]>;
        return: Awaited<ReturnType<GenerationLimitScheduleClient>>;
    };
};
export const generationLimitScheduleQueryKey = () => [{ url: "/api/csipAus/generationLimitSchedule" }] as const;
export type GenerationLimitScheduleQueryKey = ReturnType<typeof generationLimitScheduleQueryKey>;
export function generationLimitScheduleQueryOptions(options: GenerationLimitSchedule["client"]["parameters"] = {}) {
    const queryKey = generationLimitScheduleQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GenerationLimitSchedule["data"], GenerationLimitSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/generationLimitSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/generationLimitSchedule
 */
export function useGenerationLimitSchedule<TData = GenerationLimitSchedule["response"], TQueryData = GenerationLimitSchedule["response"], TQueryKey extends QueryKey = GenerationLimitScheduleQueryKey>(options: {
    query?: Partial<QueryObserverOptions<GenerationLimitSchedule["response"], GenerationLimitSchedule["error"], TData, TQueryData, TQueryKey>>;
    client?: GenerationLimitSchedule["client"]["parameters"];
} = {}): UseQueryResult<TData, GenerationLimitSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? generationLimitScheduleQueryKey();
    const query = useQuery({
        ...generationLimitScheduleQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, GenerationLimitSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const generationLimitScheduleSuspenseQueryKey = () => [{ url: "/api/csipAus/generationLimitSchedule" }] as const;
export type GenerationLimitScheduleSuspenseQueryKey = ReturnType<typeof generationLimitScheduleSuspenseQueryKey>;
export function generationLimitScheduleSuspenseQueryOptions(options: GenerationLimitSchedule["client"]["parameters"] = {}) {
    const queryKey = generationLimitScheduleSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GenerationLimitSchedule["data"], GenerationLimitSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/generationLimitSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/generationLimitSchedule
 */
export function useGenerationLimitScheduleSuspense<TData = GenerationLimitSchedule["response"], TQueryKey extends QueryKey = GenerationLimitScheduleSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<GenerationLimitSchedule["response"], GenerationLimitSchedule["error"], TData, TQueryKey>>;
    client?: GenerationLimitSchedule["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, GenerationLimitSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? generationLimitScheduleSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...generationLimitScheduleSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, GenerationLimitSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type ImportLimitScheduleClient = typeof client<ImportLimitScheduleQueryResponse, Error, never>;
type ImportLimitSchedule = {
    data: ImportLimitScheduleQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<ImportLimitScheduleClient>>;
    client: {
        parameters: Partial<Parameters<ImportLimitScheduleClient>[0]>;
        return: Awaited<ReturnType<ImportLimitScheduleClient>>;
    };
};
export const importLimitScheduleQueryKey = () => [{ url: "/api/csipAus/importLimitSchedule" }] as const;
export type ImportLimitScheduleQueryKey = ReturnType<typeof importLimitScheduleQueryKey>;
export function importLimitScheduleQueryOptions(options: ImportLimitSchedule["client"]["parameters"] = {}) {
    const queryKey = importLimitScheduleQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ImportLimitSchedule["data"], ImportLimitSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/importLimitSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/importLimitSchedule
 */
export function useImportLimitSchedule<TData = ImportLimitSchedule["response"], TQueryData = ImportLimitSchedule["response"], TQueryKey extends QueryKey = ImportLimitScheduleQueryKey>(options: {
    query?: Partial<QueryObserverOptions<ImportLimitSchedule["response"], ImportLimitSchedule["error"], TData, TQueryData, TQueryKey>>;
    client?: ImportLimitSchedule["client"]["parameters"];
} = {}): UseQueryResult<TData, ImportLimitSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? importLimitScheduleQueryKey();
    const query = useQuery({
        ...importLimitScheduleQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, ImportLimitSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const importLimitScheduleSuspenseQueryKey = () => [{ url: "/api/csipAus/importLimitSchedule" }] as const;
export type ImportLimitScheduleSuspenseQueryKey = ReturnType<typeof importLimitScheduleSuspenseQueryKey>;
export function importLimitScheduleSuspenseQueryOptions(options: ImportLimitSchedule["client"]["parameters"] = {}) {
    const queryKey = importLimitScheduleSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ImportLimitSchedule["data"], ImportLimitSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/importLimitSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/importLimitSchedule
 */
export function useImportLimitScheduleSuspense<TData = ImportLimitSchedule["response"], TQueryKey extends QueryKey = ImportLimitScheduleSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<ImportLimitSchedule["response"], ImportLimitSchedule["error"], TData, TQueryKey>>;
    client?: ImportLimitSchedule["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, ImportLimitSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? importLimitScheduleSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...importLimitScheduleSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, ImportLimitSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type LoadLimitScheduleClient = typeof client<LoadLimitScheduleQueryResponse, Error, never>;
type LoadLimitSchedule = {
    data: LoadLimitScheduleQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<LoadLimitScheduleClient>>;
    client: {
        parameters: Partial<Parameters<LoadLimitScheduleClient>[0]>;
        return: Awaited<ReturnType<LoadLimitScheduleClient>>;
    };
};
export const loadLimitScheduleQueryKey = () => [{ url: "/api/csipAus/loadLimitSchedule" }] as const;
export type LoadLimitScheduleQueryKey = ReturnType<typeof loadLimitScheduleQueryKey>;
export function loadLimitScheduleQueryOptions(options: LoadLimitSchedule["client"]["parameters"] = {}) {
    const queryKey = loadLimitScheduleQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<LoadLimitSchedule["data"], LoadLimitSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/loadLimitSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/loadLimitSchedule
 */
export function useLoadLimitSchedule<TData = LoadLimitSchedule["response"], TQueryData = LoadLimitSchedule["response"], TQueryKey extends QueryKey = LoadLimitScheduleQueryKey>(options: {
    query?: Partial<QueryObserverOptions<LoadLimitSchedule["response"], LoadLimitSchedule["error"], TData, TQueryData, TQueryKey>>;
    client?: LoadLimitSchedule["client"]["parameters"];
} = {}): UseQueryResult<TData, LoadLimitSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? loadLimitScheduleQueryKey();
    const query = useQuery({
        ...loadLimitScheduleQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, LoadLimitSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const loadLimitScheduleSuspenseQueryKey = () => [{ url: "/api/csipAus/loadLimitSchedule" }] as const;
export type LoadLimitScheduleSuspenseQueryKey = ReturnType<typeof loadLimitScheduleSuspenseQueryKey>;
export function loadLimitScheduleSuspenseQueryOptions(options: LoadLimitSchedule["client"]["parameters"] = {}) {
    const queryKey = loadLimitScheduleSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<LoadLimitSchedule["data"], LoadLimitSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/loadLimitSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/loadLimitSchedule
 */
export function useLoadLimitScheduleSuspense<TData = LoadLimitSchedule["response"], TQueryKey extends QueryKey = LoadLimitScheduleSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<LoadLimitSchedule["response"], LoadLimitSchedule["error"], TData, TQueryKey>>;
    client?: LoadLimitSchedule["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, LoadLimitSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? loadLimitScheduleSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...loadLimitScheduleSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, LoadLimitSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type ConnectionScheduleClient = typeof client<ConnectionScheduleQueryResponse, Error, never>;
type ConnectionSchedule = {
    data: ConnectionScheduleQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<ConnectionScheduleClient>>;
    client: {
        parameters: Partial<Parameters<ConnectionScheduleClient>[0]>;
        return: Awaited<ReturnType<ConnectionScheduleClient>>;
    };
};
export const connectionScheduleQueryKey = () => [{ url: "/api/csipAus/connectionSchedule" }] as const;
export type ConnectionScheduleQueryKey = ReturnType<typeof connectionScheduleQueryKey>;
export function connectionScheduleQueryOptions(options: ConnectionSchedule["client"]["parameters"] = {}) {
    const queryKey = connectionScheduleQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ConnectionSchedule["data"], ConnectionSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/connectionSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/connectionSchedule
 */
export function useConnectionSchedule<TData = ConnectionSchedule["response"], TQueryData = ConnectionSchedule["response"], TQueryKey extends QueryKey = ConnectionScheduleQueryKey>(options: {
    query?: Partial<QueryObserverOptions<ConnectionSchedule["response"], ConnectionSchedule["error"], TData, TQueryData, TQueryKey>>;
    client?: ConnectionSchedule["client"]["parameters"];
} = {}): UseQueryResult<TData, ConnectionSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? connectionScheduleQueryKey();
    const query = useQuery({
        ...connectionScheduleQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, ConnectionSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const connectionScheduleSuspenseQueryKey = () => [{ url: "/api/csipAus/connectionSchedule" }] as const;
export type ConnectionScheduleSuspenseQueryKey = ReturnType<typeof connectionScheduleSuspenseQueryKey>;
export function connectionScheduleSuspenseQueryOptions(options: ConnectionSchedule["client"]["parameters"] = {}) {
    const queryKey = connectionScheduleSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ConnectionSchedule["data"], ConnectionSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/connectionSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/connectionSchedule
 */
export function useConnectionScheduleSuspense<TData = ConnectionSchedule["response"], TQueryKey extends QueryKey = ConnectionScheduleSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<ConnectionSchedule["response"], ConnectionSchedule["error"], TData, TQueryKey>>;
    client?: ConnectionSchedule["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, ConnectionSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? connectionScheduleSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...connectionScheduleSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, ConnectionSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type EnergizeScheduleClient = typeof client<EnergizeScheduleQueryResponse, Error, never>;
type EnergizeSchedule = {
    data: EnergizeScheduleQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<EnergizeScheduleClient>>;
    client: {
        parameters: Partial<Parameters<EnergizeScheduleClient>[0]>;
        return: Awaited<ReturnType<EnergizeScheduleClient>>;
    };
};
export const energizeScheduleQueryKey = () => [{ url: "/api/csipAus/energizeSchedule" }] as const;
export type EnergizeScheduleQueryKey = ReturnType<typeof energizeScheduleQueryKey>;
export function energizeScheduleQueryOptions(options: EnergizeSchedule["client"]["parameters"] = {}) {
    const queryKey = energizeScheduleQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<EnergizeSchedule["data"], EnergizeSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/energizeSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/energizeSchedule
 */
export function useEnergizeSchedule<TData = EnergizeSchedule["response"], TQueryData = EnergizeSchedule["response"], TQueryKey extends QueryKey = EnergizeScheduleQueryKey>(options: {
    query?: Partial<QueryObserverOptions<EnergizeSchedule["response"], EnergizeSchedule["error"], TData, TQueryData, TQueryKey>>;
    client?: EnergizeSchedule["client"]["parameters"];
} = {}): UseQueryResult<TData, EnergizeSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? energizeScheduleQueryKey();
    const query = useQuery({
        ...energizeScheduleQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, EnergizeSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const energizeScheduleSuspenseQueryKey = () => [{ url: "/api/csipAus/energizeSchedule" }] as const;
export type EnergizeScheduleSuspenseQueryKey = ReturnType<typeof energizeScheduleSuspenseQueryKey>;
export function energizeScheduleSuspenseQueryOptions(options: EnergizeSchedule["client"]["parameters"] = {}) {
    const queryKey = energizeScheduleSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<EnergizeSchedule["data"], EnergizeSchedule["error"]>({
                method: "get",
                url: `/api/csipAus/energizeSchedule`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/csipAus/energizeSchedule
 */
export function useEnergizeScheduleSuspense<TData = EnergizeSchedule["response"], TQueryKey extends QueryKey = EnergizeScheduleSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<EnergizeSchedule["response"], EnergizeSchedule["error"], TData, TQueryKey>>;
    client?: EnergizeSchedule["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, EnergizeSchedule["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? energizeScheduleSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...energizeScheduleSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, EnergizeSchedule["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type CoordinatorStartClient = typeof client<CoordinatorStartMutationResponse, Error, never>;
type CoordinatorStart = {
    data: CoordinatorStartMutationResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<CoordinatorStartClient>>;
    client: {
        parameters: Partial<Parameters<CoordinatorStartClient>[0]>;
        return: Awaited<ReturnType<CoordinatorStartClient>>;
    };
};
/**
 * @link /api/coordinator/start
 */
export function useCoordinatorStart(options: {
    mutation?: UseMutationOptions<CoordinatorStart["response"], CoordinatorStart["error"], CoordinatorStart["request"]>;
    client?: CoordinatorStart["client"]["parameters"];
} = {}) {
    const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {};
    return useMutation({
        mutationFn: async () => {
            const res = await client<CoordinatorStart["data"], CoordinatorStart["error"], CoordinatorStart["request"]>({
                method: "post",
                url: `/api/coordinator/start`,
                ...clientOptions
            });
            return res;
        },
        ...mutationOptions
    });
}

 type CoordinatorStatusClient = typeof client<CoordinatorStatusQueryResponse, Error, never>;
type CoordinatorStatus = {
    data: CoordinatorStatusQueryResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<CoordinatorStatusClient>>;
    client: {
        parameters: Partial<Parameters<CoordinatorStatusClient>[0]>;
        return: Awaited<ReturnType<CoordinatorStatusClient>>;
    };
};
export const coordinatorStatusQueryKey = () => [{ url: "/api/coordinator/status" }] as const;
export type CoordinatorStatusQueryKey = ReturnType<typeof coordinatorStatusQueryKey>;
export function coordinatorStatusQueryOptions(options: CoordinatorStatus["client"]["parameters"] = {}) {
    const queryKey = coordinatorStatusQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<CoordinatorStatus["data"], CoordinatorStatus["error"]>({
                method: "get",
                url: `/api/coordinator/status`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/coordinator/status
 */
export function useCoordinatorStatus<TData = CoordinatorStatus["response"], TQueryData = CoordinatorStatus["response"], TQueryKey extends QueryKey = CoordinatorStatusQueryKey>(options: {
    query?: Partial<QueryObserverOptions<CoordinatorStatus["response"], CoordinatorStatus["error"], TData, TQueryData, TQueryKey>>;
    client?: CoordinatorStatus["client"]["parameters"];
} = {}): UseQueryResult<TData, CoordinatorStatus["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? coordinatorStatusQueryKey();
    const query = useQuery({
        ...coordinatorStatusQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, CoordinatorStatus["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const coordinatorStatusSuspenseQueryKey = () => [{ url: "/api/coordinator/status" }] as const;
export type CoordinatorStatusSuspenseQueryKey = ReturnType<typeof coordinatorStatusSuspenseQueryKey>;
export function coordinatorStatusSuspenseQueryOptions(options: CoordinatorStatus["client"]["parameters"] = {}) {
    const queryKey = coordinatorStatusSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<CoordinatorStatus["data"], CoordinatorStatus["error"]>({
                method: "get",
                url: `/api/coordinator/status`,
                ...options
            });
            return res;
        },
    });
}
/**
 * @link /api/coordinator/status
 */
export function useCoordinatorStatusSuspense<TData = CoordinatorStatus["response"], TQueryKey extends QueryKey = CoordinatorStatusSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<CoordinatorStatus["response"], CoordinatorStatus["error"], TData, TQueryKey>>;
    client?: CoordinatorStatus["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, CoordinatorStatus["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? coordinatorStatusSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...coordinatorStatusSuspenseQueryOptions(clientOptions) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, CoordinatorStatus["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}

 type CoordinatorStopClient = typeof client<CoordinatorStopMutationResponse, Error, never>;
type CoordinatorStop = {
    data: CoordinatorStopMutationResponse;
    error: Error;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: Awaited<ReturnType<CoordinatorStopClient>>;
    client: {
        parameters: Partial<Parameters<CoordinatorStopClient>[0]>;
        return: Awaited<ReturnType<CoordinatorStopClient>>;
    };
};
/**
 * @link /api/coordinator/stop
 */
export function useCoordinatorStop(options: {
    mutation?: UseMutationOptions<CoordinatorStop["response"], CoordinatorStop["error"], CoordinatorStop["request"]>;
    client?: CoordinatorStop["client"]["parameters"];
} = {}) {
    const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {};
    return useMutation({
        mutationFn: async () => {
            const res = await client<CoordinatorStop["data"], CoordinatorStop["error"], CoordinatorStop["request"]>({
                method: "post",
                url: `/api/coordinator/stop`,
                ...clientOptions
            });
            return res;
        },
        ...mutationOptions
    });
}