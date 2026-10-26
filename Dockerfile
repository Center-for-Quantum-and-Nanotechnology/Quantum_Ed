# Development image for QuantumEd: MkDocs (Python) to build and serve the site, and Node to run
# the JavaScript tests. Python 3.12 matches .github/workflows/deploy.yml. The repository is
# bind-mounted at /workspace by docker-compose.yml, so only the dependencies are baked in.
FROM python:3.12-slim

# Node is only needed for `node --test` in tests/js (Node 18 or newer); the single binary is enough.
COPY --from=node:22-slim /usr/local/bin/node /usr/local/bin/node

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /workspace

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["mkdocs", "serve", "--dev-addr", "0.0.0.0:8000"]
