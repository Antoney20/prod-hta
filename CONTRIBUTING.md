# Contributing to BPTAP
 
Thank you for your interest in contributing to the Benefits Package and Tariff Assessment Panel (BPTAP). This guide explains how to report issues, propose features, and submit code.
 
> Contributions are subject to the [LICENSE.md](./LICENSE.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Please read both before contributing.
 
---


## Issues
 
We use GitHub Issues to track bugs and questions.
 
- Search existing issues before opening a new one
- Use the provided issue templates where available
- For security vulnerabilities, **do not open a public issue** — see [SECURITY.md](./SECURITY.md)
---


## Pull Requests
 
We welcome pull requests. However, for any significant change (roughly 50+ lines or a new feature), **please open an issue first** to discuss your proposal with the maintainers before writing code. This saves your time and ensures alignment with the platform's direction.
 
Not all features will be accepted. We consider:
 
1. **Necessity** — Can the same outcome be achieved without modifying the core codebase?
2. **Impact** — Is this useful to a broad set of users?
3. **Design** — Does the proposed solution have a clean, maintainable interface?
4. **Overhead** — Does it add complexity for users who don't need it?
5. **Compatibility** — Does it break existing APIs or workflows?
When adding to an existing function or component, prefer creating a new, focused version over adding arguments to an existing one. This avoids breaking existing behaviour and keeps the codebase clean.
 

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