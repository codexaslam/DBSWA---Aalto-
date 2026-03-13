<script>
    let { id } = $props();
    let exercises = $state([]);

    const fetchExercises = async () => {
        const res = await fetch(`/api/languages/${id}/exercises`);
        if (res.ok) {
            exercises = await res.json();
        }
    };

    if (!import.meta.env.SSR) {
        fetchExercises();
    }
</script>

<h1>Available exercises</h1>
<ul>
    {#each exercises as exercise}
        <li><a href={`/exercises/${exercise.id}`}>{exercise.title}</a></li>
    {/each}
</ul>