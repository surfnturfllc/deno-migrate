FROM denoland/deno:alpine-1.40.3

RUN apk add --no-cache make

RUN mkdir /migrate-system-test
RUN chown deno /migrate-system-test
WORKDIR /migrate-system-test

USER deno

COPY ./deps.ts .
RUN deno cache ./deps.ts

COPY . .
RUN mkdir bin
RUN make
RUN chmod 755 bin/migrate
ENV PATH="${PATH}:${PWD}/bin"

RUN deno cache ./system-test/deps.ts

CMD ["test", "./system-test/system.test.ts", "--allow-run", "--allow-read", "--allow-write", "--allow-net"]
