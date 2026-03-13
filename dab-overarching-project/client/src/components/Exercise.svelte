<script>
    import ExerciseChecker from "./ExerciseChecker.svelte";

    let { id } = $props();
    let exercise = $state(null);

    const fetchExercise = async () => {
        const res = await fetch(`/api/exercises/${id}`);
        if (res.ok) {
            exercise = await res.json();
        }
    };

    if (!import.meta.env.SSR) {
        fetchExercise();
    }
</script>

{#if exercise}
    <h1>{exercise.title}</h1>
    <p>{exercise.description}</p>
    <ExerciseChecker id={id} />
{/if}