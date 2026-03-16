<script>
  import { useUserState } from "../states/userState.svelte.js";

  let userState = useUserState();
</script>

{#if !userState.loading}
    {#if userState.email}
        <p>{userState.email}</p>
    {:else}
        <a href="/auth/login">Login</a>
        <a href="/auth/register">Register</a>
    {/if}
{/if}