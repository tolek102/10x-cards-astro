import { AuthProvider } from "./providers/AuthProvider";
import App from "./App";

export const AppRoot = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};
