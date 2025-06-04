import React, { useContext, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import Games from "./pages/Games";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import GamePage from "./pages/GamePage";
import PrivateRoute from "./components/PrivateRoute";
import ChatBot from "./pages/ChatBot";
import { AuthContext } from "./providers/AuthProvider";
import UserDashboard from "./pages/User/UserDashboard";
import RecommandationGame from "./pages/RecommandationGame";
import ScrollToTop from "./components/ScrollToTop";
import SimilarGamesPage from "./pages/User/SimilarGamesPage";

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [showChatBot, setShowChatBot] = useState(false);
  const [recommendedGames, setRecommendedGames] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      setShowChatBot(true);
    } else {
      setShowChatBot(false);
    }
  }, [isAuthenticated]);

  const handleGameRecommendations = (games) => {
    setRecommendedGames(games);
  };

  return (
    <>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/games" element={<Games />} />
        <Route path="/gamepage/:id" element={<GamePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />

        {/* Routes protégées */}
        <Route
          path="/similar-games"
          element={
            <PrivateRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
              <SimilarGamesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user"
          element={
            <PrivateRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/recommandation"
          element={
            <PrivateRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
              <RecommandationGame games={recommendedGames} />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>

      {showChatBot && <ChatBot onGameRecommendations={handleGameRecommendations} />}

      <Footer />
    </>
  );
};

export default App;
