import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./page/HomePage";
import DestinationDetail from "./page/DestinationDetailPage";
import PlaceDetail from "./page/PlaceDetailPage";
import SearchCategoryPage from "./page/SearchCategoryPage";
import TripPlanner from "./page/TripPlannerPage";
import TripList from "./page/TripListPage";
import Itinerary from "./page/Itinerary";
import { AuthProvider } from "./context/AuthProvider";
import MainLayout from "./layouts/MainLayout";
import TripDetail from "./page/TripDetailPage";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes dùng layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/destination/place/:id" element={<PlaceDetail />} />
          <Route path="/category/:category" element={<SearchCategoryPage />} />
          <Route path="/trip-planner" element={<TripPlanner />} />
          <Route path="/trip-list" element={<TripList />} />
          <Route path="/trips/:id" element={<TripDetail />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
};

export default App;
