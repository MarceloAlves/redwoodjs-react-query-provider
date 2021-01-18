import * as React from 'react'
import { FetchConfigProvider, GraphQLHooksProvider } from '@redwoodjs/web'
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query'
import { useFetchConfig } from '@redwoodjs/web'
import { GraphQLClient } from 'graphql-request'
import { DocumentNode, getOperationAST } from 'graphql'
import { Variables } from 'graphql-request/dist/types'
import { GraphQLHookOptions } from '@redwoodjs/web/dist/components/GraphQLHooksProvider'

type UseCustomQueryOptions = GraphQLHookOptions & UseQueryOptions

const useGraphqlClient = () => {
  const { uri, headers } = useFetchConfig()
  const graphqlClient = new GraphQLClient(uri, { headers })
  return graphqlClient
}

export const useCustomQuery = (query: DocumentNode, { variables, ...options }: UseCustomQueryOptions) => {
  const document = getOperationAST(query)
  const name = document?.name?.value
  const graphqlClient = useGraphqlClient()

  const result = useQuery([name, variables], () => graphqlClient.request(query, variables), options)

  return {
    loading: result.isLoading,
    ...result,
    variables,
  }
}

export const useCustomMutation = (query: DocumentNode, options: UseMutationOptions) => {
  const graphqlClient = useGraphqlClient()

  // TODO: Fix types here
  // @ts-ignore
  const result = useMutation(
    ({ variables }: { variables: Variables }) => graphqlClient.request(query, variables),
    options
  )

  return [result.mutate, { loading: result.isLoading, ...result }]
}

export function RedwoodReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <FetchConfigProvider>
      {/* @ts-ignore */}
      <GraphQLHooksProvider useQuery={useCustomQuery} useMutation={useCustomMutation}>
        {children}
      </GraphQLHooksProvider>
    </FetchConfigProvider>
  )
}
