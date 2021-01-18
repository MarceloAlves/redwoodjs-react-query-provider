import type { PluginObj, types } from '@babel/core'

// This wraps a file that has a suffix of `RQCell` in a custom variant of Redwood's `withRQCell` higher
// order component. The HOC deals with the lifecycle methods during a GraphQL query.
//
// ```js
// import { withRQCell } from '@rwjsexperiments/plugin'
// <YOUR CODE>
// export default withRQCell({ QUERY, Loading, Fetching, Success, Failure, Empty, beforeQuery, afterQuery })
// ```

// A cell can export the declarations below.
const EXPECTED_EXPORTS_FROM_CELL = [
  'beforeQuery',
  'RQUERY',
  'afterQuery',
  'Loading',
  'Fetching',
  'Success',
  'Failure',
  'Empty',
]

export default function ({ types: t }: { types: typeof types }): PluginObj {
  // This array will
  // - collect exports from the Cell file during ExportNamedDeclaration
  // - collected exports will then be passed to `withRQCell`
  // - be cleared after Program exit to prepare for the next file
  let exportNames: string[] = []
  let hasDefaultExport = false

  return {
    name: 'babel-plugin-redwood-rqcell',
    visitor: {
      ExportDefaultDeclaration() {
        hasDefaultExport = true
        return
      },
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration

        if (!declaration) {
          return
        }

        let name
        if (declaration.type === 'VariableDeclaration') {
          const id = declaration.declarations[0].id as types.Identifier
          name = id.name as string
        }
        if (declaration.type === 'FunctionDeclaration') {
          name = declaration?.id?.name
        }

        if (name && EXPECTED_EXPORTS_FROM_CELL.includes(name)) {
          exportNames.push(name)
        }
      },
      Program: {
        exit(path) {
          // Validate that this file has exports which are "cell-like":
          // If the user is not exporting `RQUERY`, then we do not care.

          if (hasDefaultExport && !exportNames.includes('RQUERY')) {
            return
          }

          if (!exportNames.includes('RQUERY')) {
            return
          }

          // Insert at the top of the file:
          // + import { withRQCell } from '@rwjsexperiments/plugin'
          path.node.body.unshift(
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier('withRQCell'),
                  t.identifier('withRQCell')
                ),
              ],
              t.stringLiteral('@rwjsexperiments/react')
            )
          )

          // Insert at the bottom of the file:
          // + export default withRQCell({ QUERY?, Loading?, Fetching?, Success?, Failure?, Empty?, beforeQuery?, afterQuery? })
          path.node.body.push(
            t.exportDefaultDeclaration(
              t.callExpression(t.identifier('withRQCell'), [
                t.objectExpression(
                  exportNames.map((name) =>
                    t.objectProperty(
                      t.identifier(name === 'RQUERY' ? 'QUERY': name),
                      t.identifier(name),
                      false,
                      true
                    )
                  )
                ),
              ])
            )
          )

          hasDefaultExport = false
          exportNames = []
        },
      },
    },
  }
}