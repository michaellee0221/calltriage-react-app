import { BrowserRouter, Route, Routes } from "react-router-dom";
import Join from "./pages/Join";
import Chat from "./pages/Chat";
import "./App.css"; // Assuming you have a CSS file for global styles

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/join/:profileId" element={<Join />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
