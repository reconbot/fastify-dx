import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import kebabCase from 'lodash.kebabcase'

export async function resolveInit (filename) {
  for (const variant of [filename, `${filename}.mjs`, `${filename}.js`]) {
    const resolvedPath = resolve(process.cwd(), variant)
    if (existsSync(resolvedPath)) {
      const app = await import(resolvedPath)
      return [app, dirname(resolvedPath)]
    }
  }
}

export const kImmediate = Symbol('kImmediate')

export function immediate (command) {
  command[kImmediate] = true
  return command
}

async function getExitHandler (context) {
  try {
    if (context.app) {
      await context.app.close()
    }
    setImmediate(() => process.exit(0))
  } catch (error) {
    console.log(error)
    if (context.app) {
      context.app.log.error(error)
    }
    setImmediate(() => process.exit(1))
  }
}

export function getDispatcher (context, commands) {
  const dispatcher = async function () {
    for (const command of commands) {

    }
  }
}

export async function getContext (filename) {
  const [init, root] = await resolveInit(filename)
  return {
    root,
    tenants: init.tenants,
    init: init.default,
    renderer: init.renderer,
    port: init.port || 3000,
    host: init.host,
  }
}

export const devLogger = {
  translateTime: 'HH:MM:ss Z',
  ignore: 'pid,hostname'
}

