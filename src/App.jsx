import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./frontend/pages/LoginPage";
import DashboardPage from "./frontend/pages/DashboardPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <LoginPage/> } />
        <Route path="/dashboard" element={ <DashboardPage/> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
