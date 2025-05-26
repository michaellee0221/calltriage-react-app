import { BrowserRouter, Route, Routes } from "react-router-dom"
import Join from "./pages/Join"
import Chat from "./pages/Chat"


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/join/:id" element={<Join />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
