# Contributing to Core Fire Portal

Thank you for your interest in contributing to Core Fire Portal! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/core-fire-portal.git
   cd core-fire-portal
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
pnpm dev
```

This starts the development server with hot module replacement at `http://localhost:5000`.

### Code Style

- **TypeScript**: All code must be written in TypeScript with proper type annotations
- **Formatting**: Use Prettier for code formatting (run `pnpm format`)
- **Linting**: Ensure TypeScript compilation passes (run `pnpm check`)
- **Naming Conventions**:
  - Use `camelCase` for variables and functions
  - Use `PascalCase` for components and types
  - Use `UPPER_SNAKE_CASE` for constants

### Testing

Before submitting a pull request:

1. **Run type checking**:
   ```bash
   pnpm check
   ```

2. **Run tests**:
   ```bash
   pnpm test
   ```

3. **Test your changes manually** in the browser

### Commit Messages

Follow conventional commit format:

- `feat: add new feature`
- `fix: resolve bug in component`
- `docs: update README`
- `style: format code`
- `refactor: restructure module`
- `test: add unit tests`
- `chore: update dependencies`

Example:
```bash
git commit -m "feat: add email validation to agreement form"
```

## Project Structure Guidelines

### Frontend (Client)

- **Components**: Place reusable UI components in `client/src/components/`
- **Pages**: Place page-level components in `client/src/pages/`
- **Hooks**: Custom React hooks go in `client/src/hooks/`
- **Utilities**: Helper functions belong in `client/src/lib/`

### Backend (Server)

- **Routers**: tRPC procedures go in `server/routers.ts`
- **Database**: Database operations belong in `server/db.ts`
- **Business Logic**: Create separate modules for complex logic (e.g., `pdfGenerator.ts`, `emailService.ts`)

### Shared Code

- Place code used by both client and server in `shared/`
- Keep types and constants in `shared/types.ts` and `shared/const.ts`

## Making Changes

### Adding a New Feature

1. **Plan your feature**: Discuss significant changes in an issue first
2. **Write code**: Implement your feature following the code style guidelines
3. **Add tests**: Write tests for new functionality
4. **Update documentation**: Update README.md or add inline comments
5. **Test thoroughly**: Ensure all tests pass and the feature works as expected

### Fixing a Bug

1. **Identify the issue**: Reproduce the bug and understand its cause
2. **Write a test**: Create a test that fails due to the bug (if applicable)
3. **Fix the bug**: Implement the fix
4. **Verify**: Ensure the test passes and the bug is resolved
5. **Document**: Add comments explaining the fix if necessary

### Database Changes

When modifying the database schema:

1. **Update schema**: Modify `drizzle/schema.ts`
2. **Generate migration**:
   ```bash
   pnpm db:push
   ```
3. **Test migration**: Ensure it works on a clean database
4. **Document changes**: Update README.md with new schema information

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Screenshots for UI changes
   - Reference to related issues

4. **Respond to feedback**: Address review comments promptly

5. **Merge**: Once approved, your PR will be merged

## Code Review Guidelines

When reviewing pull requests:

- Be respectful and constructive
- Focus on code quality, not personal preferences
- Check for:
  - Correct TypeScript types
  - Proper error handling
  - Security considerations
  - Performance implications
  - Test coverage

## Common Tasks

### Adding a New UI Component

```typescript
// client/src/components/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### Adding a New tRPC Procedure

```typescript
// server/routers.ts
export const appRouter = router({
  // ... existing procedures
  myNewProcedure: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      // Implementation
      return result;
    }),
});
```

### Adding a Database Table

```typescript
// drizzle/schema.ts
export const myNewTable = mysqlTable("my_new_table", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Questions or Need Help?

- Open an issue for bug reports or feature requests
- Check existing issues and pull requests first
- Contact the maintainers for guidance

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Core Fire Portal!
