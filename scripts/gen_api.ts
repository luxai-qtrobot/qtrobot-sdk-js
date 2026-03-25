/**
 * Code generator — reads IDL files and writes src/api/*.ts
 *
 * Usage:  npm run gen
 */

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { CORE_RPC, CORE_STREAM } from '../src/idl/api_core'
import { PLUGINS_RPC, PLUGINS_STREAM } from '../src/idl/api_plugins'
import type { RpcEntry, StreamEntry, ParamDef, FrameClass } from '../src/idl/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUT_DIR = resolve(__dirname, '../src/api')

// ─── Type helpers ────────────────────────────────────────────────────────────

function idlParamToTs(type: string): string {
  switch (type) {
    case 'string':  return 'string'
    case 'number':  return 'number'
    case 'boolean': return 'boolean'
    case 'object':  return 'Record<string, unknown>'
    case 'array':   return 'unknown[]'
    default:        return 'unknown'
  }
}

function idlReturnToTs(type: string): string {
  switch (type) {
    case 'void':    return 'void'
    case 'boolean': return 'boolean'
    case 'number':  return 'number'
    case 'string':  return 'string'
    case 'object':  return 'Record<string, unknown>'
    case 'array':   return 'unknown[]'
    default:        return 'unknown'
  }
}

// ─── Naming helpers ──────────────────────────────────────────────────────────

function toCamelCase(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toPascalCase(s: string): string {
  const cc = toCamelCase(s)
  return cc.charAt(0).toUpperCase() + cc.slice(1)
}

function nsClassName(ns: string): string {
  return toPascalCase(ns) + 'Api'
}

// ─── Frame class metadata ────────────────────────────────────────────────────

interface FrameMeta {
  tsType: string
  /** Named imports to add from the given module path */
  imports: Array<{ names: string[]; from: string }>
  /** Factory expression — only for 'out' streams */
  factory?: string
  /** Serializer expression — only for 'in' streams */
  serializer?: string
}

const FRAME_META: Record<FrameClass, FrameMeta> = {
  AudioFrameRaw: {
    tsType: 'AudioFrameRaw',
    imports: [{ names: ['AudioFrameRaw', 'Frame'], from: "'@luxai-qtrobot/magpie'" }],
    factory:    'raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw',
    serializer: 'f => f.toDict()',
  },
  AudioFrameFlac: {
    tsType: 'AudioFrameFlac',
    imports: [{ names: ['AudioFrameFlac', 'Frame'], from: "'@luxai-qtrobot/magpie'" }],
    factory:    'raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameFlac',
    serializer: 'f => f.toDict()',
  },
  ImageFrameRaw: {
    tsType: 'ImageFrameRaw',
    imports: [{ names: ['ImageFrameRaw', 'Frame'], from: "'@luxai-qtrobot/magpie'" }],
    factory:    'raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw',
    serializer: 'f => f.toDict()',
  },
  ImageFrameJpeg: {
    tsType: 'ImageFrameJpeg',
    imports: [{ names: ['ImageFrameJpeg', 'Frame'], from: "'@luxai-qtrobot/magpie'" }],
    factory:    'raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameJpeg',
    serializer: 'f => f.toDict()',
  },
  JointStateFrame: {
    tsType: 'JointStateFrame',
    imports: [{ names: ['JointStateFrame'], from: "'../frames/joint_state'" }],
    factory: 'JointStateFrame.fromRaw',
  },
  JointCommandFrame: {
    tsType: 'JointCommandFrame',
    imports: [{ names: ['JointCommandFrame'], from: "'../frames/joint_command'" }],
    serializer: 'f => f.toDict()',
  },
  JointTrajectoryFrame: {
    tsType: 'JointTrajectoryFrame',
    imports: [{ names: ['JointTrajectoryFrame'], from: "'../frames/joint_command'" }],
    serializer: 'f => f.toDict()',
  },
  DictValue: {
    tsType: 'Record<string, unknown>',
    imports: [],
    factory: "raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>)",
  },
  StringValue: {
    tsType: 'string',
    imports: [],
    factory: "raw => ((raw as { value?: string }).value ?? '')",
  },
  ListValue: {
    tsType: 'unknown[]',
    imports: [],
    factory: "raw => ((raw as { value?: unknown[] }).value ?? [])",
  },
}

// ─── Argument helpers ────────────────────────────────────────────────────────

function buildArgsExpr(params: ParamDef[], optMode: 'none' | 'positional' | 'spread'): string {
  const required = params.filter(p => !p.optional)
  const optional = params.filter(p => p.optional)
  if (optMode === 'spread') {
    const parts = required.map(p => p.name)
    if (optional.length > 0) parts.push('...options')
    return `{ ${parts.join(', ')} }`
  }
  if (optMode === 'positional') {
    return `{ ${params.map(p => p.name).join(', ')} }`
  }
  return `{ ${required.map(p => p.name).join(', ')} }`
}

type OptMode = 'none' | 'positional' | 'spread'
function optMode(params: ParamDef[]): OptMode {
  const n = params.filter(p => p.optional).length
  if (n === 0) return 'none'
  if (n === 1) return 'positional'
  return 'spread'
}

// ─── Code generation ─────────────────────────────────────────────────────────

function generateNs(
  ns: string,
  rpcs: Record<string, RpcEntry>,
  streams: Record<string, StreamEntry>,
): string {
  const className = nsClassName(ns)

  // Collect imports
  const needsActionHandle = Object.values(rpcs).some(e => e.cancel)
  const needsStreamReader = Object.values(streams).some(e => e.direction === 'out')
  const needsStreamWriter = Object.values(streams).some(e => e.direction === 'in')

  // Frame imports: collect unique module → names
  const importMap = new Map<string, Set<string>>()
  const addImport = (names: string[], from: string) => {
    if (!importMap.has(from)) importMap.set(from, new Set())
    for (const n of names) importMap.get(from)!.add(n)
  }

  for (const entry of Object.values(streams)) {
    const meta = FRAME_META[entry.frameClass]
    for (const imp of meta.imports) {
      addImport(imp.names, imp.from)
    }
  }

  const lines: string[] = []
  lines.push(`// AUTO-GENERATED — do not edit directly.`)
  lines.push(`// Edit src/idl/api_core.ts (or api_plugins.ts) and run \`npm run gen\`.`)
  lines.push(``)
  lines.push(`import type { Robot } from '../client'`)
  if (needsActionHandle) lines.push(`import { ActionHandle } from '../actions'`)
  if (needsStreamReader || needsStreamWriter) {
    const streamImports: string[] = []
    if (needsStreamReader) streamImports.push('TypedStreamReader')
    if (needsStreamWriter) streamImports.push('TypedStreamWriter')
    lines.push(`import { ${streamImports.join(', ')} } from '../streams'`)
  }

  // Sorted frame imports
  const sortedImportSources = [...importMap.keys()].sort()
  for (const from of sortedImportSources) {
    const names = [...importMap.get(from)!].sort().join(', ')
    lines.push(`import { ${names} } from ${from}`)
  }

  lines.push(``)

  // ── Options types ──────────────────────────────────────────────────────────
  for (const [key, entry] of Object.entries(rpcs)) {
    const methodPart = key.split('.').slice(1).join('.')
    const mode = optMode(entry.params)
    if (mode !== 'spread') continue
    const typeName = toPascalCase(ns) + toPascalCase(methodPart) + 'Options'
    const optParams = entry.params.filter(p => p.optional)
    lines.push(`export type ${typeName} = {`)
    for (const p of optParams) {
      lines.push(`  /** ${p.doc} */`)
      lines.push(`  ${p.name}?: ${idlParamToTs(p.type)}`)
    }
    lines.push(`}`)
    lines.push(``)
  }

  // ── Class body ────────────────────────────────────────────────────────────
  lines.push(`export class ${className} {`)
  lines.push(`  constructor(private readonly _robot: Robot) {}`)
  lines.push(``)

  // ── RPC methods ────────────────────────────────────────────────────────────
  for (const [key, entry] of Object.entries(rpcs)) {
    const methodPart = key.split('.').slice(1).join('.')
    const methodName = toCamelCase(methodPart)
    const MethodName = toPascalCase(methodPart)
    const retTs = idlReturnToTs(entry.returns)
    const required = entry.params.filter(p => !p.optional)
    const optional = entry.params.filter(p => p.optional)
    const mode = optMode(entry.params)
    const optTypeName = toPascalCase(ns) + MethodName + 'Options'
    const argsExpr = buildArgsExpr(entry.params, mode)

    // Build parameter list for blocking method
    const paramParts: string[] = []
    for (const p of required) {
      paramParts.push(`${p.name}: ${idlParamToTs(p.type)}`)
    }
    if (mode === 'spread') {
      paramParts.push(`options?: ${optTypeName}`)
    } else if (mode === 'positional') {
      const op = optional[0]
      paramParts.push(`${op.name}?: ${idlParamToTs(op.type)}`)
    }
    paramParts.push(`timeoutSec?: number`)
    const paramStr = paramParts.join(', ')

    // JSDoc
    lines.push(`  /**`)
    lines.push(`   * ${entry.doc}`)
    for (const p of required) {
      lines.push(`   * @param ${p.name} ${p.doc}`)
    }
    if (mode === 'spread') {
      lines.push(`   * @param options Optional parameters.`)
    } else if (mode === 'positional') {
      const op = optional[0]
      lines.push(`   * @param ${op.name} ${op.doc}`)
    }
    lines.push(`   * @param timeoutSec RPC timeout in seconds.`)
    if (retTs !== 'void') {
      lines.push(`   * @returns ${retTs}`)
    }
    lines.push(`   */`)

    if (retTs === 'void') {
      lines.push(`  async ${methodName}(${paramStr}): Promise<void> {`)
      lines.push(`    await this._robot.rpcCall('${entry.service}', ${argsExpr}, timeoutSec)`)
    } else {
      lines.push(`  async ${methodName}(${paramStr}): Promise<${retTs}> {`)
      lines.push(`    return this._robot.rpcCall<${retTs}>('${entry.service}', ${argsExpr}, timeoutSec)`)
    }
    lines.push(`  }`)
    lines.push(``)

    // Async (cancellable) variant
    if (entry.cancel) {
      const asyncParamParts: string[] = []
      for (const p of required) asyncParamParts.push(`${p.name}: ${idlParamToTs(p.type)}`)
      if (mode === 'spread') asyncParamParts.push(`options?: ${optTypeName}`)
      else if (mode === 'positional') {
        const op = optional[0]
        asyncParamParts.push(`${op.name}?: ${idlParamToTs(op.type)}`)
      }
      const asyncParamStr = asyncParamParts.join(', ')
      const asyncRetTs = retTs === 'void' ? 'void' : retTs
      lines.push(`  /** ${entry.doc} Returns a cancellable handle. */`)
      lines.push(`  ${methodName}Async(${asyncParamStr}): ActionHandle<${asyncRetTs}> {`)
      lines.push(`    const result = this._robot.rpcCall<${asyncRetTs}>('${entry.service}', ${argsExpr})`)
      lines.push(`    const cancel = () => this._robot.rpcCall<void>('${entry.cancel}', {})`)
      lines.push(`    return new ActionHandle(result, cancel)`)
      lines.push(`  }`)
      lines.push(``)
    }
  }

  // ── Stream methods ────────────────────────────────────────────────────────
  for (const [key, entry] of Object.entries(streams)) {
    const streamPart = key.split('.').slice(1).join('.')
    const methodName = toCamelCase(streamPart)
    const MethodName = toPascalCase(streamPart)
    const meta = FRAME_META[entry.frameClass]
    const tsType = meta.tsType

    if (entry.direction === 'out') {
      // Callback subscriber
      lines.push(`  /**`)
      lines.push(`   * ${entry.doc}`)
      lines.push(`   * @param handler Called for each incoming frame.`)
      lines.push(`   * @param onError Called if the stream encounters an error.`)
      lines.push(`   * @returns Unsubscribe function.`)
      lines.push(`   */`)
      lines.push(`  on${MethodName}(handler: (frame: ${tsType}) => void, onError?: (err: Error) => void): () => void {`)
      lines.push(`    return this._robot.getStreamReader<${tsType}>(`)
      lines.push(`      '${entry.topic}',`)
      lines.push(`      ${meta.factory!},`)
      lines.push(`    ).onFrame(handler, onError)`)
      lines.push(`  }`)
      lines.push(``)

      // Reader
      lines.push(`  /**`)
      lines.push(`   * ${entry.doc}`)
      lines.push(`   *`)
      lines.push(`   * @example`)
      lines.push(`   * for await (const frame of robot.${ns}.${methodName}Reader()) {`)
      lines.push(`   *   // handle frame`)
      lines.push(`   * }`)
      lines.push(`   * @param queueSize Internal frame buffer size (default: ${entry.queueSize ?? 10}).`)
      lines.push(`   */`)
      lines.push(`  ${methodName}Reader(queueSize?: number): TypedStreamReader<${tsType}> {`)
      lines.push(`    return this._robot.getStreamReader<${tsType}>(`)
      lines.push(`      '${entry.topic}',`)
      lines.push(`      ${meta.factory!},`)
      lines.push(`      queueSize,`)
      lines.push(`    )`)
      lines.push(`  }`)
      lines.push(``)
    } else {
      // Writer
      lines.push(`  /**`)
      lines.push(`   * ${entry.doc}`)
      lines.push(`   * @returns Stream writer. Call \`writer.write(frame)\` to send frames.`)
      lines.push(`   */`)
      lines.push(`  open${MethodName}Writer(): TypedStreamWriter<${tsType}> {`)
      lines.push(`    return this._robot.getStreamWriter<${tsType}>(`)
      lines.push(`      '${entry.topic}',`)
      lines.push(`      ${meta.serializer!},`)
      lines.push(`    )`)
      lines.push(`  }`)
      lines.push(``)
    }
  }

  lines.push(`}`)
  lines.push(``)

  return lines.join('\n')
}

// ─── Entry point ─────────────────────────────────────────────────────────────

function collectNamespaces(
  rpc: Record<string, RpcEntry>,
  stream: Record<string, StreamEntry>,
): Set<string> {
  const ns = new Set<string>()
  for (const key of Object.keys(rpc)) ns.add(key.split('.')[0])
  for (const key of Object.keys(stream)) ns.add(key.split('.')[0])
  return ns
}

function filterByNs<T>(map: Record<string, T>, ns: string): Record<string, T> {
  return Object.fromEntries(Object.entries(map).filter(([k]) => k.startsWith(ns + '.')))
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  // Core APIs
  const coreNs = collectNamespaces(CORE_RPC, CORE_STREAM)
  for (const ns of coreNs) {
    const rpcs   = filterByNs(CORE_RPC, ns)
    const streams = filterByNs(CORE_STREAM, ns)
    const code = generateNs(ns, rpcs, streams)
    const outPath = resolve(OUT_DIR, `${ns}.ts`)
    writeFileSync(outPath, code, 'utf8')
    console.log(`Generated ${outPath}`)
  }

  // Plugin APIs
  const pluginNs = collectNamespaces(PLUGINS_RPC, PLUGINS_STREAM)
  for (const ns of pluginNs) {
    const rpcs   = filterByNs(PLUGINS_RPC, ns)
    const streams = filterByNs(PLUGINS_STREAM, ns)
    const code = generateNs(ns, rpcs, streams)
    const outPath = resolve(OUT_DIR, `${ns}.ts`)
    writeFileSync(outPath, code, 'utf8')
    console.log(`Generated ${outPath}`)
  }

  // Regenerate index
  const allNs = new Set([...coreNs, ...pluginNs])
  const indexLines = [...allNs].sort().map(ns => `export { ${nsClassName(ns)} } from './${ns}'`)
  writeFileSync(resolve(OUT_DIR, 'index.ts'), indexLines.join('\n') + '\n', 'utf8')
  console.log(`Generated ${resolve(OUT_DIR, 'index.ts')}`)
}

main()
