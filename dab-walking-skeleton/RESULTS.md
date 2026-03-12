## k6 test results with a single replica with CPU limit 0.1

```
    checks_total.......: 3931    390.653808/s
    checks_succeeded...: 100.00% 3931 out of 3931
    checks_failed......: 0.00%   0 out of 3931

    ✓ status is 200

    HTTP
    http_req_duration..............: avg=12.62ms min=208.2µs  med=1.25ms max=491.76ms p(90)=82.78ms p(95)=88.41ms
    { expected_response:true }...: avg=12.62ms min=208.2µs  med=1.25ms max=491.76ms p(90)=82.78ms p(95)=88.41ms
    http_req_failed................: 0.00%  0 out of 3931
    http_reqs......................: 3931   390.653808/s

    EXECUTION
    iteration_duration.............: avg=12.77ms min=244.87µs med=1.39ms max=492.09ms p(90)=82.97ms p(95)=88.54ms
    iterations.....................: 3931   390.653808/s
    vus............................: 5      min=5         max=5
    vus_max........................: 5      min=5         max=5

    NETWORK
    data_received..................: 802 kB 80 kB/s
    data_sent......................: 267 kB 27 kB/s
```

## k6 test results with five replicas, each with CPU limit 0.1

```
    checks_total.......: 38247   3823.157997/s
    checks_succeeded...: 100.00% 38247 out of 38247
    checks_failed......: 0.00%   0 out of 38247

    ✓ status is 200

    HTTP
    http_req_duration..............: avg=1.25ms min=146.16µs med=435.28µs max=698.2ms  p(90)=840.48µs p(95)=1.2ms
    { expected_response:true }...: avg=1.25ms min=146.16µs med=435.28µs max=698.2ms  p(90)=840.48µs p(95)=1.2ms
    http_req_failed................: 0.00%  0 out of 38247
    http_reqs......................: 38247  3823.157997/s

    EXECUTION
    iteration_duration.............: avg=1.3ms  min=170.66µs med=474.94µs max=698.38ms p(90)=909.69µs p(95)=1.32ms
    iterations.....................: 38247  3823.157997/s
    vus............................: 5      min=5          max=5
    vus_max........................: 5      min=5          max=5

    NETWORK
    data_received..................: 7.8 MB 780 kB/s
    data_sent......................: 2.6 MB 260 kB/s
```

## Reflection

The performance increase observed when scaling from 1 to 5 replicas was significantly greater than 5-fold (nearly 10-fold, from ~390 req/s to ~3823 req/s).

With a single replica limited to 0.1 CPU, the container quickly exhausts its CPU quota under load, leading to severe throttling by the container runtime (CFS quota). This throttling introduces significant latency (p95 of ~88ms), causing the client threads (virtual users) to spend most of their time waiting for responses rather than sending new requests.

When scaling to 5 replicas, the total available CPU capacity increases to 5x 0.1 = 0.5 CPU. However, because the load is distributed across multiple containers, each individual container is less likely to hit the aggressive throttling threshold as frequently or as severely as the single overloaded container. This results in drastically lower latency (p95 dropped to ~1.2ms). Because the response time is much faster, the fixed number of concurrent users (5 VUs) can complete many more request-response cycles per second, leading to a total throughput increase that exceeds simple linear scaling based on CPU count alone. The system moved from a state of high-latency throttling to a more balanced load distribution.
