# Contributing to envtrap

Thank you for your interest in contributing to envtrap! We welcome community contributions, bug reports, and feedback.

As a security-focused project, we ask that you follow these guidelines to keep the project clean, secure, and maintainable.

---

## 🛠️ Monorepo Structure & Setup

This repository is managed as a monorepo. You will need Node.js (v18+) and `pnpm` installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vishal-770/envtrap.git
   cd envtrap
   ```

2. **Install all dependencies:**
   ```bash
   pnpm install
   ```

### Project Folders

- `/package`: The core npm package code, containing the runtime interception logic and CLI.
- `/landing-page`: Next.js web application for the product website.
- `/test-server`: An Express application used for simulating credential leaks.

---

## 🧪 Developing & Testing

### Core Agent (`/package`)

To make changes to the security agent:
1. Navigate to `/package`.
2. Build the TypeScript files:
   ```bash
   pnpm build
   ```
3. Run integration tests to ensure your changes didn't break runtime boundaries:
   ```bash
   pnpm test
   ```

### Test Server (`/test-server`)

To verify exfiltration triggers locally:
1. Navigate to `/test-server`.
2. Run the server under envtrap protection:
   ```bash
   npm run secure
   ```
3. Test endpoints (e.g., `http://localhost:3001/leak-console`, `/leak-http`) using curl or your browser.

---

## 📝 Pull Request Guidelines

1. **Keep PRs focused:** Submit separate pull requests for unrelated features or bug fixes.
2. **Write tests:** Ensure new code is covered by integration tests in the `/package/test` directory.
3. **Commit message style:** Use standard conventional commit formats (e.g. `feat(cli): add quiet flag`, `fix(interceptor): patch net socket boundary`).
4. **Lint your code:** Run the linter before submitting.
