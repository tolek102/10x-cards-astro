# Layouts Structure

This application uses a unified layout component:

## BaseLayout.astro

Base layout component that provides common structure for all pages:

- Common `<head>` section with meta tags
- Global CSS imports and styles
- FontAwesome integration
- ViewTransitions(ClientRouter) for smooth page transitions
- Providers wrapper for React context
- Navigation bar (optional, for authenticated routes)
- Toast notifications (for authenticated routes)
- Basic page structure

Used in:

- All public pages (login, register, reset password, etc.)
- All authenticated pages (creator, preview, learning)

## Layout Usage Guidelines

1. For public pages, use `BaseLayout` without navigation props
2. For authenticated pages, pass the `showNav` prop along with required navigation properties
3. All React components within layouts should use `client:load` directive
4. Keep layout-specific styles in the layout file
