<script context="module">
export const clientOnly = true

export function getMeta () { 
  return {
    title: 'Client Only Page',
  }
}
</script>

<script>
import { Link } from 'svelte-routing'
</script>

<p>This route is rendered on the client only!</p>
<p>
  <Link to="/">Go back to the index</Link>
</p>
<p>⁂</p>
<p>When this route is rendered on the server, no SSR takes place.</p>
<p>See the output of <code>curl http://localhost:3000/client-only</code>.</p>
