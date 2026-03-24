import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes.tsx";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;