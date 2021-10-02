import * as React from 'react'
import { useAuth } from '@redwoodjs/auth'
import { FetchConfigProvider, GraphQLHooksProvider } from '@redwoodjs/web'
import { useFetchConfig } from '@redwoodjs/web'
import { DocumentNode, getOperationAST } from 'graphql'
import { GraphQLClient } from 'graphql-request'
import { Variables } from 'graphql-request/dist/types'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'

// Export these in case user wants to statically type e.g. a `beforeQuery`
export type UseCustomQueryOptions = GraphQLQueryHookOptions &
  UseQueryOptions<unknown, unknown, Variables>
export type UseCustomMutationOptions = GraphQLMutationHookOptions &
  UseMutationOptions<unknown, unknown, Variables>

const useGraphqlClient = () => {
  const { uri } = useFetchConfig()
  const graphqlClient = new GraphQLClient(uri)
  return graphqlClient
}

/**
 * Builds a query key for the given GraphQL query & variables.
 * Use when you want to access a query made by a cell.
 *
 * **Example**
 * ```ts
 * const QUERY = gql`...`
 * ...
 * const queryClient = useQueryClient()
 * queryClient.invalidateQuery(buildQueryKey(QUERY))
 * ```
 */
export const buildQueryKey = (
  query: DocumentNode,
  variables: Record<string, unknown>
) => {
  const document = getOperationAST(query)
  const name = document?.name?.value
  return [name, variables]
}

/** Returns a function which makes the given GraphQL request when invoked. */
export const useClientRequest = <T extends unknown = unknown>(
  query: DocumentNode,
  variables: Record<string, unknown>
) => {
  const { isAuthenticated, getToken, type } = useAuth()
  const graphqlClient = useGraphqlClient()

  return async () => {
    let requestHeaders: HeadersInit = {}

    if (isAuthenticated) {
      const token = await getToken()

      requestHeaders = {
        'auth-provider': type,
        authorization: `Bearer ${token}`,
      }
    }

    return graphqlClient.request<T>(query, variables, requestHeaders)
  }
}

export const useCustomQuery = (
  query: DocumentNode,
  options?: UseCustomQueryOptions
) => {
  const { variables = {}, queryKey, ...rest } = options ?? {}
  const key = queryKey ?? buildQueryKey(query, variables)
  const clientRequest = useClientRequest(query, variables)

  const result = useQuery(key, clientRequest, rest)

  return {
    loading: result.isLoading,
    ...result,
    variables,
  }
}

export const usePrefetchQuery = (
  query: DocumentNode,
  options?: UseCustomQueryOptions
) => {
  const { variables = {}, queryKey, ...rest } = options ?? {}
  const key = queryKey ?? buildQueryKey(query, variables)
  const clientRequest = useClientRequest(query, variables)

  const queryClient = useQueryClient()

  return (opts?: UseCustomQueryOptions) =>
    queryClient.prefetchQuery(key, clientRequest, { ...rest, ...opts })
}

export const useCustomMutation = (
  query: DocumentNode,
  options?: UseCustomMutationOptions
) => {
  const { isAuthenticated, getToken, type } = useAuth()
  const graphqlClient = useGraphqlClient()

  const result = useMutation(async (variables) => {
    let requestHeaders: HeadersInit = {}

    if (isAuthenticated) {
      const token = await getToken()

      requestHeaders = {
        'auth-provider': type,
        authorization: `Bearer ${token}`,
      }
    }

    return graphqlClient.request(query, variables, requestHeaders)
  }, options)

  return [result.mutate, { loading: result.isLoading, ...result }]
}

export const RedwoodReactQueryProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <FetchConfigProvider>
      <GraphQLHooksProvider
        useQuery={useCustomQuery}
        useMutation={useCustomMutation}
      >
        {children}
      </GraphQLHooksProvider>
    </FetchConfigProvider>
  )
}
