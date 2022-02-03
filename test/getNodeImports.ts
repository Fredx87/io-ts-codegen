import * as assert from 'assert'
import * as t from '../src'

describe('getNodeImports', () => {
  it('should support basic type', () => {
    assert.deepEqual(t.getNodesImports([t.stringType]), {})
  })

  it('should support imported identifier with from', () => {
    const identifier = t.importedIdentifier('A', './A.ts')
    const expected: t.NodeImports = { './A.ts': new Set('A') }
    assert.deepEqual(t.getNodesImports([identifier]), expected)
  })

  it('should support imported identifier with from and as', () => {
    const identifier = t.importedIdentifier('A', './A.ts', 'B')
    const expected: t.NodeImports = { './A.ts': new Set(['A as B']) }
    assert.deepEqual(t.getNodesImports([identifier]), expected)
  })

  it('should support multiple nodes', () => {
    const array = t.arrayCombinator(t.importedIdentifier('A', './A.ts'))
    const type = t.typeCombinator([
      t.property('B', t.importedIdentifier('A2', './A.ts')),
      t.property('C', t.importedIdentifier('C', './C.ts'))
    ])
    const expected: t.NodeImports = { './A.ts': new Set(['A', 'A2']), './C.ts': new Set(['C']) }

    assert.deepEqual(t.getNodesImports([array, type]), expected)
  })

  it('should support duplicate identifiers', () => {
    const union = t.unionCombinator([t.importedIdentifier('A', './A.ts'), t.importedIdentifier('B', './B.ts')])

    const record = t.recordCombinator(
      t.stringType,
      t.unionCombinator([
        t.importedIdentifier('A', './A.ts'),
        t.importedIdentifier('A2', './A.ts'),
        t.importedIdentifier('B', './B.ts')
      ])
    )

    const expected: t.NodeImports = { 
      './A.ts': new Set(['A', 'A2']),
      './B.ts': new Set(['B']),
    }

    assert.deepEqual(t.getNodesImports([union, record]), expected)
  })
})
