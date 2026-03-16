<script>
  import { authClient } from "../../utils/auth.js";

  let email = $state("");
  let password = $state("");
  let name = $state("");

  const register = async (e) => {
    e.preventDefault();

    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
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

<form onsubmit={register}>
  <label for="name">Name</label>
  <input type="text" id="name" bind:value={name} />

  <label for="email">Email</label>
  <input type="email" id="email" bind:value={email} />

  <label for="password">Password</label>
  <input type="password" id="password" bind:value={password} />

  <button type="submit">Register</button>
</form>