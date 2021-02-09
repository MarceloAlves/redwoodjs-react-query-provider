import * as React from 'react'
import { FetchConfigProvider, GraphQLHooksProvider } from '@redwoodjs/web'
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query'
import { useFetchConfig } from '@redwoodjs/web'
import { GraphQLClient } from 'graphql-request'
import { DocumentNode, getOperationAST } from 'graphql'
import { Variables } from 'graphql-request/dist/types'
import { GraphQLHookOptions } from '@redwoodjs/web/dist/components/GraphQLHooksProvider'
import { useAuth } from '@redwoodjs/auth'

type UseCustomQueryOptions = GraphQLHookOptions & UseQueryOptions

const useGraphqlClient = () => {
  const { uri } = useFetchConfig()
  const graphqlClient = new GraphQLClient(uri)
  return graphqlClient
}

export const useCustomQuery = (query: DocumentNode, { variables, ...options }: UseCustomQueryOptions) => {
  const { isAuthenticated, getToken, type } = useAuth()
  const document = getOperationAST(query)
  const name = document?.name?.value
  const graphqlClient = useGraphqlClient()

  const result = useQuery(
    [name, variables],
    async () => {
      let requestHeaders: HeadersInit = {}

      if (isAuthenticated) {
        const token = await getToken()

        requestHeaders = {
          'auth-provider': type,
          authorization: `Bearer ${token}`,
        }
      }

      return graphqlClient.request(query, variables, requestHeaders)
    },
    options
  )

  return {
    loading: result.isLoading,
    ...result,
    variables,
  }
}

export const useCustomMutation = (query: DocumentNode, options: UseMutationOptions) => {
  const { isAuthenticated, getToken, type } = useAuth()
  const graphqlClient = useGraphqlClient()

  // TODO: Fix types here
  // @ts-ignore
  const result = useMutation(async ({ variables }: { variables: Variables }) => {
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

export function RedwoodReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <FetchConfigProvider>
      <GraphQLHooksProvider useQuery={useCustomQuery as any} useMutation={useCustomMutation as any}>
        {children}
      </GraphQLHooksProvider>
    </FetchConfigProvider>
  )
}
