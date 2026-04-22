# Contributing to BPTAP

Thank you for your interest in improving BPTAP. This document outlines how to contribute effectively.

> **Note:** BPTAP is a source-available project developed by CEMA for the Ministry of Health, Kenya. Contributions are welcome but subject to review and the terms of the [LICENSE.md](./LICENSE.md).

---

## Ways to Contribute

### Reporting Issues

If you find a bug, please open an issue and include:

- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs. actual behaviour
- Screenshots or error logs if applicable
- Browser and OS details

###  Suggesting Features or Improvements

We welcome ideas that improve Kenya's HTA process. When suggesting a feature:

- Check existing issues first to avoid duplicates
- Describe the problem it solves, not just the solution
- Consider impact on different user groups (citizens, MoH, county governments, etc.)

### Submitting Code

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write clear, typed code** — this project uses TypeScript; avoid `any` types.

3. **Test your changes** before submitting.

4. **Commit with meaningful messages:**
   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Open a Pull Request** against `main` with:
   - A summary of what changed and why
   - Screenshots for UI changes
   - Reference to the related issue (e.g., `Closes #42`)

---

## Code Style

- Follow existing patterns in the codebase
- Use TypeScript strictly — no implicit `any`
- Components go in `components/`, pages in `app/`
- Keep components small and focused

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation only |
| `refactor:` | Code restructuring |
| `chore:` | Tooling, dependencies |

---

## Review Process

All contributions are reviewed by the CEMA development team. We aim to respond to pull requests within **5 working days**. Contributions that align with MoH requirements and the platform's public health mandate are prioritised.

---

## Questions?

Open a discussion or reach out via **info@cema.africa**.