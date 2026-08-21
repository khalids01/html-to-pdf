FROM oven/bun:1

WORKDIR /app

# Keep Playwright's Chromium outside node_modules so its location is stable at
# build and runtime.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Chromium and its Linux libraries are required for PDF generation.
RUN bunx playwright install --with-deps chromium

COPY . .
RUN bun run build

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["bun", "run", "start"]
