<script>
  import { authClient } from "../../utils/auth.js";

  let email = $state("");
  let password = $state("");

  const login = async (e) => {
    e.preventDefault();

    const { data, error } = await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: (ctx) => {
          alert(ctx.error.message);
        },
        onSuccess: (ctx) => {
          window.location.href = "/";
        },
      }
    );
  };
</script>

<form onsubmit={login}>
  <label for="email">Email</label>
  <input type="email" id="email" bind:value={email} />

  <label for="password">Password</label>
  <input type="password" id="password" bind:value={password} />

  <button type="submit">Login</button>
</form>