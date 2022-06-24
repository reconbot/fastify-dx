
<sub>**Go back to the [index](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-dx-svelte/README.md).**</sub>

<br>

## Virtual Modules

**Fastify DX** relies on [virtual modules](https://github.com/rollup/plugins/tree/master/packages/virtual) to save your project from having too many boilerplate files. Virtual modules are a [Rollup](https://rollupjs.org/guide/en/) feature exposed and fully supported by [Vite](https://vitejs.dev/). When you see imports that start with `/dx:`, you know a Fastify DX virtual module is being used.

Fastify DX virtual modules are **fully ejectable**. For instance, the starter template relies on the `/dx:root.vue` virtual module to provide the Vue shell of your application. If you copy the `root.vue` file [from the fastify-dx-svelte package](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-dx-svelte/virtual/root.vue) and place it your Vite project root, **that copy of the file is used instead**. In fact, the starter template already comes with a custom `root.vue` of its own to include UnoCSS.

Aside from `root.vue`, the starter template comes with two other virtual modules already ejected and part of the local project — `context.js` and `layouts/default.vue`. If you don't need to customize them, you can safely removed them from your project.

### `/dx:root.svelte`

This is the root Vue component. It's used internally by `/dx:create.js` and provided as part of the starter template. You can use this file to add a common layout to all routes. The version provided as part of the starter template includes [UnoCSS](https://github.com/unocss/unocss)'s own virtual module import, necessary to enable its CSS engine.

```svelte
<script>
import 'uno.css'
import { proxy } from 'sveltio'
import { Router, Route } from 'svelte-routing'
import DXRoute from '/dx:route.svelte'

export let url = null
export let payload

let state = proxy(payload.serverRoute.state)
</script>

<Router url="{url}">
  {#each payload.routes as { path, component }}
    <Route path="{path}" let:location>
      <DXRoute 
        path={path}
        location={location}
        state={state}
        payload={payload}
        component={component} />
    </Route>
  {/each}
</Router>
```

### `/dx:routes.js`

Fastify DX has **code-splitting** out of the box. It does that by eagerly loading all route data on the server, and then hydrating any missing metadata on the client. That's why the routes module default export is conditioned to `import.meta.env.SSR`, and different helper functions are called for each rendering environment.

```js
export default import.meta.env.SSR
  ? createRoutes(import.meta.globEager('$globPattern'))
  : hydrateRoutes(import.meta.glob('$globPattern'))
```

See [the full file](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-dx-svelte/virtual/routes.js) for the `createRoutes()` and `hydrateRoutes()` definitions. 

If you want to use your own custom routes list, you must eject this file as-is and replace the glob imports with your own routes list:

```js
const routes = [
  { 
    path: '/', 
    component: () => import('/custom/index.vue'),
  }
]

export default import.meta.env.SSR
  ? createRoutes(routes)
  : hydrateRoutes(routes)
````

### `/dx:core.js`

Implements `useRouteContext()` and `createBeforeEachHandler()`, used by `core.js`.

`DXApp` is imported by `root.vue` and encapsulates Fastify DX's route component API.

> Vue Router's [nested routes](https://router.vuejs.org/guide/essentials/nested-routes.html) aren't supported yet.

See its full definition [here](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-dx-svelte/virtual/core.js).

### `/dx:create.js`

This virtual module creates your root Vue component. 

This is where `root.vue` is imported.

<b>You'll rarely need to customize this file.</b>

```js
import { createApp, createSSRApp, reactive, ref } from 'vue'
import { createRouter } from 'vue-router'
import {
  isServer,
  createHistory,
  serverRouteContext,
  routeLayout,
  createBeforeEachHandler,
} from '/dx:core.js'
import root from '/dx:root.vue'

export default async function create (ctx) {
  const { routes, ctxHydration } = ctx

  const instance = ctxHydration.clientOnly
    ? createApp(root)
    : createSSRApp(root)

  const history = createHistory()
  const router = createRouter({ history, routes })
  const layoutRef = ref(ctxHydration.layout ?? 'default')

  instance.provide(routeLayout, layoutRef)
  ctxHydration.state = reactive(ctxHydration.state)

  if (isServer) {
    instance.provide(serverRouteContext, ctxHydration)
  } else {
    router.beforeEach(createBeforeEachHandler(ctx, layoutRef))
  }

  instance.use(router)

  if (ctx.url) {
    router.push(ctx.url)
    await router.isReady()
  }

  return { instance, ctx, router }
}
```

What you see above is its [full definition](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-dx-svelte/virtual/create.js).

### `/dx:layouts.js`

This is responsible for loading **layout components**. It's part of `route.svelte` by default. If a project has no `layouts/default.vue` file, the default one from Fastify DX is used. This virtual module works in conjunction with the `/dx:layouts/` virtual module which provides exports from the `/layouts` folder.

<b>You'll rarely need to customize this file.</b>

```svelte

```

What you see above is its [full definition](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-dx-svelte/virtual/layout.vue).

### `/dx:mount.js`

This is the file `index.html` links to by default. It sets up the application with an `unihead` instance for head management, the initial route context, and provides the conditional mounting logic to defer to CSR-only if `clientOnly` is enabled.

<b>You'll rarely need to customize this file.</b>

[See the full file](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-dx-svelte/virtual/mount.js) for the `mount()` function definition.