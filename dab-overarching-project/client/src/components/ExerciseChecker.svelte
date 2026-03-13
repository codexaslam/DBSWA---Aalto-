<script>
    let text = $state("");
    let stats = $state(null);

    function check() {
        // Count occurrences of "if"
        const ifCount = (text.match(/if/g) || []).length;
        
        stats = {
            chars: text.length,
            ifs: ifCount
        };
    }
</script>

<textarea bind:value={text}></textarea>
<button onclick={check}>Submit</button>

{#if stats}
    <p>Characters: {stats.chars}</p>
    <p>ifs: {stats.ifs}</p>
{/if}
