# Layouts Structure

This application uses two layout components:

## BaseLayout.astro

Base layout component that provides common structure for authenticated pages:

- Common `<head>` section with meta tags
- Global CSS imports and styles
- FontAwesome integration
- ViewTransitions(ClientRouter) for smooth page transitions
- Providers wrapper for React context
- Navigation bar (optional, for authenticated routes)
- Toast notifications (for authenticated routes)
- Basic page structure

Used in:
- All authenticated pages (creator, preview, learning)

## AuthLayout.astro

Minimal layout component for authentication pages:

- Common `<head>` section with meta tags
- Global CSS imports and styles
- FontAwesome integration
- Basic page structure
- No Providers wrapper (handled by AuthForms component)

Used in:
- All auth pages (login, register, reset password)

## Layout Usage Guidelines

1. For auth pages, use `AuthLayout` with title prop
2. For authenticated pages, use `BaseLayout` with `showNav` prop and required navigation properties
3. All React components within layouts should use `client:load` directive
4. Keep layout-specific styles in the layout file
