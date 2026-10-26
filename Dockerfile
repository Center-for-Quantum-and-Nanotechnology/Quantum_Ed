# Development image for QuantumEd: MkDocs (Python) to build and serve the site, Node to run the
# JavaScript tests, and git. Used by docker-compose.yml and by .devcontainer/devcontainer.json, so
# everyone on the team gets the same tools. Python 3.12 matches .github/workflows/deploy.yml. The
# repository is bind-mounted at /workspace, so only the tools and dependencies are baked in.
FROM python:3.12-slim

# Node is only needed for `node --test` in tests/js (Node 18 or newer); the single binary is enough.
COPY --from=node:22-slim /usr/local/bin/node /usr/local/bin/node

# git, for source control inside the container (VS Code uses it too).
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/* \
    && git config --system --add safe.directory /workspace

# Work as a normal user, not root, so files written into the bind-mounted repository (docs/glossary.md,
# site/) belong to you on Linux and macOS. UID 1000 is the usual first user; the dev container adjusts
# it to match yours. Override at build time with --build-arg if you need a different one.
ARG USER_UID=1000
ARG USER_GID=1000
RUN groupadd --gid ${USER_GID} dev \
    && useradd --uid ${USER_UID} --gid ${USER_GID} --create-home --shell /bin/bash dev

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /workspace

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

USER dev

EXPOSE 8000

CMD ["mkdocs", "serve", "--dev-addr", "0.0.0.0:8000"]
