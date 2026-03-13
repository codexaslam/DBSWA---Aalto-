<script>
    let languages = $state([]);

    const fetchLanguages = async () => {
        const res = await fetch("/api/languages");
        languages = await res.json();
    };

    if (!import.meta.env.SSR) {
        fetchLanguages();
    }
</script>

<h1>Available languages</h1>
<ul>
    {#each languages as language}
        <li><a href={`/languages/${language.id}`}>{language.name}</a></li>
    {/each}
</ul>