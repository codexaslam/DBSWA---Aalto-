FROM denoland/deno:alpine-1.40.3

WORKDIR /app

COPY . .

RUN deno cache app-run.js

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "app-run.js"]