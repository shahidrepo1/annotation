import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/layout/Layout";
import SrTraining from "./pages/SrTraining";
import Stt from "./pages/Stt";
import LoginPage from "./pages/Login";
import PageNotFound from "./pages/NotFound";
import LogoDetection from "./pages/LogoDetection";
import FacialRecognition from "./pages/Fr";
import AdDetection from "./pages/AdDetectionVideo";
import TickerAndFlasher from "./pages/TickerAndFlasher";
import AdDetectionAudio from "./pages/AdDetectionAudio";
import AdDetectionVideoAndFrame from "./pages/AdDetectionAudioAndFrame";
import Temp from "./pages/Temp";
import ObjectDetection from "./pages/ObjectDetection";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import OCRMediaUrdu from "./pages/OCRMediaUrdu";
import OCRDocUrdu from "./pages/OCRDocUrdu";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="sr-training" element={<SrTraining />} />
          <Route path="stt" element={<Stt />} />
          <Route path="logo-detection" element={<LogoDetection />} />
          <Route path="fr" element={<FacialRecognition />} />
          <Route path="ad-detection-frame" element={<AdDetection />} />
          <Route path="ad-detection-audio" element={<AdDetectionAudio />} />
          <Route
            path="ad-detection-audio&frame"
            element={<AdDetectionVideoAndFrame />}
          />
          <Route path="ticker-and-flasher" element={<TickerAndFlasher />} />
          <Route path="object-detection" element={<ObjectDetection />} />
          <Route path="sentiment-analysis" element={<SentimentAnalysis />} />
          <Route path="ocr-media-urdu" element={<OCRMediaUrdu />} />
          <Route path="ocr-doc-urdu" element={<OCRDocUrdu />} />
        </Route>
        <Route path="/" element={<LoginPage />} />
        <Route path="/temp" element={<Temp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
