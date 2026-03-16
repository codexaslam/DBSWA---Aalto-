<script>
    import { useUserState } from "../states/userState.svelte.js";
    import ExerciseChecker from "./ExerciseChecker.svelte";

    let { id } = $props();
    let exercise = $state(null);
    let userState = useUserState();

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
    {#if !userState.loading}
        {#if userState.email}
            <ExerciseChecker id={id} />
        {:else}
            <p>Login or register to complete exercises.</p>
        {/if}
    {/if}
{/if}