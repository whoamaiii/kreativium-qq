## Brief overview
These guidelines specify the preferred style for generating React components to ensure consistency and leverage modern React features.

## Coding best practices
- **Functional Components:** Always generate React components as functional components.
  - *Example:* `const MyComponent = (props) => { return <div>Hello</div>; };`
- **Hooks:** Utilize React Hooks (e.g., `useState`, `useEffect`, `useContext`) for state management, side effects, and other lifecycle-related logic within functional components.
- **TypeScript:** All React components should be written in TypeScript to leverage static typing for better code quality and maintainability.
  - *Example:* `interface MyComponentProps { title: string; } const MyComponent: React.FC<MyComponentProps> = ({ title }) => { return <h1>{title}</h1>; };`
