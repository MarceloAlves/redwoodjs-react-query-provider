# RedwoodJS React Query Provider

A provider that replaces `RedwoodProvder` with `react-query` + `graphql-request`

## Usage

Install dependencies

```sh
$ yarn add react-query graphql-request redwoodjs-react-query-provider
```

Add to `src/index.js`

```tsx
import { AuthProvider } from '@redwoodjs/auth'
import { FatalErrorBoundary } from '@redwoodjs/web'
import { QueryClientProvider, QueryClient } from 'react-query'
import { RedwoodReactQueryProvider } from 'redwoodjs-react-query-provider'
import FatalErrorPage from 'src/pages/FatalErrorPage'
import MainLayout from './layouts/MainLayout/MainLayout'
import ReactDOM from 'react-dom'
import Routes from 'src/Routes'

const queryClient = new QueryClient()

ReactDOM.render(
  <FatalErrorBoundary page={FatalErrorPage}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider client={auth0} type="auth0">
        <RedwoodReactQueryProvider>
          <MainLayout>
            <Routes />
          </MainLayout>
        </RedwoodReactQueryProvider>
      </AuthProvider>
    </QueryClientProvider>
  </FatalErrorBoundary>,
  document.getElementById('redwood-app')
)
```
