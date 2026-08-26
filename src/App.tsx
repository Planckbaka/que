import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { WorldProvider } from "@/components/motion/WorldWipe";
import ShowcasePage from "@/pages/ShowcasePage";

export default function App() {
  return (
    <WorldProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ShowcasePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WorldProvider>
  );
}
