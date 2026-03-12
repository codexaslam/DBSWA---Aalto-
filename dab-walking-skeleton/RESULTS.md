## k6 test results with CPU 0.1

```
    checks_total.......: 4726    470.423758/s
    checks_succeeded...: 100.00% 4726 out of 4726
    checks_failed......: 0.00%   0 out of 4726

    ✓ status is 200

    HTTP
    http_req_duration..............: avg=10.48ms min=127.37µs med=1.04ms max=499.88ms p(90)=3.93ms p(95)=86.04ms
    { expected_response:true }...: avg=10.48ms min=127.37µs med=1.04ms max=499.88ms p(90)=3.93ms p(95)=86.04ms
    http_req_failed................: 0.00%  0 out of 4726
    http_reqs......................: 4726   470.423758/s

    EXECUTION
    iteration_duration.............: avg=10.61ms min=157.24µs med=1.13ms max=500.05ms p(90)=4.3ms p(95)=86.29ms
    iterations.....................: 4726   470.423758/s
    vus............................: 5      min=5         max=5
    vus_max........................: 5      min=5         max=5

    NETWORK
    data_received..................: 964 kB 96 kB/s
    data_sent......................: 317 kB 32 kB/s
```

## k6 test results with CPU 0.5

```
    checks_total.......: 109459  10945.103929/s
    checks_succeeded...: 100.00% 109459 out of 109459
    checks_failed......: 0.00%   0 out of 109459

    ✓ status is 200

    HTTP
    http_req_duration..............: avg=420.47µs min=53.7µs  med=344.4µs  max=188.76ms p(90)=503.65µs p(95)=624.86µs
    { expected_response:true }...: avg=420.47µs min=53.7µs  med=344.4µs  max=188.76ms p(90)=503.65µs p(95)=624.86µs
    http_req_failed................: 0.00%  0 out of 109459
    http_reqs......................: 109459 10945.103929/s

    EXECUTION
    iteration_duration.............: avg=452.89µs min=73.33µs med=374.07µs max=190.95ms p(90)=537.57µs p(95)=672.74µs
    iterations.....................: 109459 10945.103929/s
    vus............................: 5      min=5           max=5
    vus_max........................: 5      min=5           max=5

    NETWORK
    data_received..................: 22 MB  2.2 MB/s
    data_sent......................: 7.3 MB 733 kB/s
```

## Reflection

The performance increase observed when adjusting the CPU limit from 0.1 to 0.5 was significantly greater than five-fold (approximately 23x, from ~470 req/s to ~10,945 req/s).

This non-linear scaling can be attributed to how CPU quotas work in containerized environments (CFS Quota). With a strict limit of 0.1 CPU (10ms of CPU time per 100ms period), the process is aggressively throttled. When the application utilizes its full 10ms quota quickly, it is paused for the remaining 90ms of the period, introducing significant latency and effectively halting processing. This overhead and forced idle time dominate the throughput, preventing the application from effectively utilizing even the small slice it has.

At 0.5 CPU, the container has a much larger quota (50ms per 100ms), reducing the likelihood and frequency of throttling. Additionally, the base overhead of the runtime (Deno) and OS context switching consumes a fixed portion of CPU time; at 0.1 CPU, this overhead leaves very little capacity for actual request processing. At 0.5 CPU, a much larger proportion of the available CPU time can be dedicated to serving requests.
