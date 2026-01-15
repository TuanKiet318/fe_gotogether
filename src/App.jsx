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
import { AuthProvider } from "./context/AuthProvider";
import MainLayout from "./layouts/MainLayout";
import TripDetail from "./page/TripDetailPage";
import PrivateRoute from "./routes/PrivateRoute";
import FoodDetail from "./page/FoodDetailPage";
import AcceptInvite from "./page/AcceptInvitePage";
import MyProfile from "./components/MyProfile.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ItineraryEditor from "./page/ItineraryEditor.jsx";
import ItineraryLandingPage from "./page/ItineraryLandingPage.jsx";
import MyItinerariesPage from "./page/MyItinerariesPage.jsx";
import TourListPage from "./page/TourListPage.jsx";
import TourDetailPage from "./page/TourDetailPage.jsx";
import TravelBlog from "./page/BlogPage.jsx";
import VietnamTravelExplore from "./page/VietnamTravelExplore.jsx";
import { NotificationProvider } from "./context/NotificationContext";
import TravelProfilePage from "./page/TravelProfilePage.jsx";
import BlogDetailPage from "./page/BlogDetailPage";
import TermsOfService from "./page/TermsOfServicePage.jsx";
import PrivacyPolicy from "./page/PrivacyPolicyPage.jsx";
import SupportPage from "./page/SupportPage.jsx";
import DestionationsPage from "./page/DestinationsPage.jsx";
import DestinationsPage from "./page/DestinationsPage.jsx";

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ScrollToTop />
        <Toaster
          position="bottom-left"
          richColors
          style={{ marginBottom: "20px" }}
        />
        <Routes>
          <Route
            path="/dashboard"
            element={<div>Trang Bảng Điều Khiển Người Dùng</div>}
          />

          {/* Routes dùng layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/destination/:id" element={<DestinationDetail />} />
            <Route path="/destination/place/:id" element={<PlaceDetail />} />
            <Route
              path="/category/:category"
              element={<SearchCategoryPage />}
            />
            <Route path="/trip-planner" element={<TripPlanner />} />
            <Route path="/foods/:id" element={<FoodDetail />} />
            <Route path="/itinerary-editor/:id" element={<ItineraryEditor />} />
            <Route path="/itinerary/:id" element={<ItineraryDetailPage />} />
            <Route
              path="/itineraries/:id/landing"
              element={<ItineraryLandingPage />}
            />
            <Route
              path="/trip-list"
              element={
                <PrivateRoute>
                  <TripList />
                </PrivateRoute>
              }
            />
            <Route path="/tours" element={<TourListPage />} />
            <Route path="/tour/detail/:tourId" element={<TourDetailPage />} />

            {/* Route MyProfile */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <MyProfile />
                </PrivateRoute>
              }
            />

            {/*  Route MyProfile */}
            <Route
              path="/me"
              element={
                <PrivateRoute>
                  <TravelProfilePage />
                </PrivateRoute>
              }
            />

            <Route path="/invite" element={<AcceptInvite />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/itineraries/new" element={<CreateItineraryPage />} />
            <Route path="/itineraries/:id" element={<ItineraryDetailPage />} />
            <Route path="/blogs" element={<TravelBlog />} />
            <Route path="/blogs/:blogId" element={<BlogDetailPage />} />
            <Route path="/explores" element={<VietnamTravelExplore />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
