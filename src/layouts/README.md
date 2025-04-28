# Layouts Structure

This application uses two main layout components:

## BaseLayout.astro
Base layout component that provides common structure for all pages:
- Common `<head>` section with meta tags
- Global CSS imports
- FontAwesome integration
- ViewTransitions(ClientRouter) for smooth page transitions
- Providers wrapper for React context
- Basic page structure

Used in:
- All public pages (login, register, reset password, etc.)
- As a base for AuthenticatedLayout

## AuthenticatedLayout.astro
Extends BaseLayout and adds authentication-specific features:
- User authentication check with automatic redirect to login
- Navigation bar with user info and section navigation
- Toast notifications
- Main content wrapper

Used in:
- Creator page (/creator)
- Preview page (/preview)
- Learning page (/learning)

## Layout Usage Guidelines
1. Use `BaseLayout.astro` for public pages that don't require authentication
2. Use `AuthenticatedLayout.astro` for pages that require user authentication
3. All React components should be loaded with `client:load` directive when used within layouts
4. Keep layout-specific styles in their respective .astro files 