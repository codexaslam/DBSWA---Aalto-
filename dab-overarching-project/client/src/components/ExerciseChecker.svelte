<script>
    let { id } = $props();

    let text = $state("");
    let gradingStatus = $state(null);
    let grade = $state(null);

    const submit = async () => {
        gradingStatus = "pending";
        grade = null;

        const res = await fetch(`/api/exercises/${id}/submissions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ source_code: text })
        });

        if (res.ok) {
            const data = await res.json();
            const submissionId = data.id;
            pollStatus(submissionId);
        }
    };

    const pollStatus = (submissionId) => {
        const interval = setInterval(async () => {
            const res = await fetch(`/api/submissions/${submissionId}/status`);
            if (res.ok) {
                const data = await res.json();
                gradingStatus = data.grading_status;
                grade = data.grade;

                if (gradingStatus === "graded") {
                    clearInterval(interval);
                }
            }
        }, 500);
    };
</script>

<textarea bind:value={text}></textarea>
<button onclick={submit}>Submit</button>

{#if gradingStatus !== null}
    <p>Grading status: {gradingStatus}</p>
{/if}
{#if grade !== null}
    <p>Grade: {grade}</p>
{/if}
