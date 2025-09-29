import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "./page/HomePage";
import DestinationDetail from "./page/DestinationDetailPage";
import PlaceDetail from "./page/PlaceDetailPage";
import SearchCategoryPage from "./page/SearchCategoryPage";
import CreateItineraryPage from "./page/CreateItineraryPage";
import ItineraryDetailPage from "./page/ItineraryDetailPage";
import TripPlanner from "./page/TripPlannerPage";
import TripList from "./page/TripListPage";
import Itinerary from "./page/Itinerary";
import { AuthProvider } from "./context/AuthProvider";
import MainLayout from "./layouts/MainLayout";
import TripDetail from "./page/TripDetailPage";
import PrivateRoute from "./routes/PrivateRoute";
import FoodDetail from "./page/FoodDetailPage";
import AcceptInvite from "./page/AcceptInvitePage";
import ScrollToTop from "./components/ScrollToTop.jsx";

const App = () => {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Toaster position="top-right" richColors style={{ marginTop: "60px" }} />
      <Routes>
        <Route
          path="/dashboard"
          element={<div>Trang Bảng Điều Khiển Người Dùng</div>}
        />

        {/* Routes dùng layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/destination/place/:id" element={<PlaceDetail />} />
          <Route path="/category/:category" element={<SearchCategoryPage />} />
          <Route path="/trip-planner" element={<TripPlanner />} />
          <Route path="/foods/:id" element={<FoodDetail />} />
          <Route
            path="/trip-list"
            element={
              <PrivateRoute>
                <TripList />
              </PrivateRoute>
            }
          />
          <Route path="/invite" element={<AcceptInvite />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/itineraries/new" element={<CreateItineraryPage />} />
          <Route path="/itineraries/:id" element={<ItineraryDetailPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
