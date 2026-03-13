<script>
  import { commentState } from "../states/commentState.svelte.js";

  let newComment = $state('');

  const addComment = () => {
    if (newComment.trim() !== '') {
      commentState.addComment(newComment);
      newComment = '';
    }
  };
</script>

<div>
  <input type="text" bind:value={newComment} placeholder="Add a comment..." />
  <button onclick={addComment}>Add</button>
</div>

<ul>
  {#each commentState.comments as comment}
    <li>{comment}</li>
  {/each}
</ul>