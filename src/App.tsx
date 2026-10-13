
import { RouterProvider } from "react-router-dom";
import router from "./routes/appRoutes";
import AuthInitializer from "./pages/auth/authInitializer";

function App() {
  return (
    <>
      <AuthInitializer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;