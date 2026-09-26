// metro.config.js
//
// Metro resolves neither the tsconfig "paths" mapping nor the alias declared in
// vite.config.ts, so native code importing "@/lib/..." needs it declared here.
// This file loads fine as ESM under "type": "module" -- only the Babel config
// has to be CommonJS.
import { getDefaultConfig } from '@expo/metro-config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const config = getDefaultConfig(projectRoot)

// Mirrors vite.config.ts: '@' -> './src'
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@': path.resolve(projectRoot, 'src'),
}

export default config
