import { Navigate, Outlet } from "react-router";
import Header from "../ui/Header";
import useAuthLoader from "../../hooks/useAuthLoader";

export default function Layout() {
  const { loading, userName } = useAuthLoader();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-aquagreen-800">
        <p className="m-5 text-center">Loading...</p>
      </div>
    );
  }

  if (!userName) {
    return <Navigate to="/login" />;
  }
  return (
    <div>
      <Header />
      <div className="p-8">
        <Outlet />
      </div>
    </div>
  );
}
