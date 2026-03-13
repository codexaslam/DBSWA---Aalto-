<script>
  let fact = $state("");

  const fetchFact = async () => {
    const response = await fetch("https://dogapi.dog/api/v2/facts");
    const json = await response.json();
    if (json && json.data && json.data.length > 0) {
      fact = json.data[0].attributes.body;
    }
  };
</script>

<button onclick={fetchFact}>Fetch a dog fact</button>

<p>{fact}</p>