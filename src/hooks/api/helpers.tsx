import { Enabled, Query, QueryKey } from "@tanstack/react-query";

export function combineEnabled<TQueryFnData, TError, TData, TQueryKey extends QueryKey>(lhs: Enabled<TQueryFnData, TError, TData, TQueryKey> | undefined = true, rhs: Enabled<TQueryFnData, TError, TData, TQueryKey> | undefined = true) {
    return (query: Query<TQueryFnData, TError, TData, TQueryKey>) => (typeof lhs === 'function' ? lhs(query) : lhs) && (typeof rhs === 'function' ? rhs(query) : rhs);
}