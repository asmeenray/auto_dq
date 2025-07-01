# Contributing to autoDQ

Thank you for your interest in contributing to autoDQ! This document provides guidelines and instructions for contributing.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/auto_dq.git
   cd auto_dq
   ```
3. **Set up development environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ./scripts/setup-simple.sh
   ```

## 🛠️ Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Follow the existing code style and patterns
- Write clear, concise commit messages
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Start the development environment
docker-compose -f docker-compose.simple.yml up -d

# Run frontend tests (if available)
cd frontend && npm test

# Run backend tests (if available)
cd backend && npm test
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new data quality indicator type"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
- `feat: add PostgreSQL data source support`
- `fix: resolve JWT token expiration issue`
- `docs: update API documentation`

## 🏗️ Code Style

### Frontend (React/TypeScript)
- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Prefer functional components over class components

### Backend (Node.js/TypeScript)
- Use TypeScript for all new code
- Follow Express.js best practices
- Use async/await over Promises
- Implement proper error handling

### General Guidelines
- Write self-documenting code with clear variable names
- Add comments for complex business logic
- Keep functions small and focused
- Use consistent naming conventions

## 🧪 Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting PR
- Add integration tests for API endpoints
- Test with different data sources when applicable

## 📚 Documentation

When contributing, please:
- Update relevant documentation
- Add JSDoc comments for functions/classes
- Update README.md if needed
- Document new API endpoints

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Docker version, etc.)
- Logs or error messages

## 💡 Feature Requests

For feature requests:
- Describe the use case clearly
- Explain the expected behavior
- Consider backward compatibility
- Discuss implementation approach

## 🔍 Code Review Process

1. All submissions require review
2. Maintainers will review PRs within 48 hours
3. Address feedback promptly
4. Maintain a clean commit history
5. Squash commits if requested

## 📋 Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No sensitive information is committed
- [ ] Changes are backward compatible
- [ ] Performance impact is considered

## 🆘 Getting Help

- Create an issue for questions
- Join discussions in existing issues
- Check documentation first
- Be respectful and patient

## 📧 Contact

For major changes or architectural decisions, please create an issue first to discuss the approach.

Thank you for contributing to autoDQ! 🚀
