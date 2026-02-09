import "./App.css";
import CanvasRoot from "@/ui/components/CanvasRoot";
import TopBar from "@/ui/toolbar/TopBar";
import BottomBar from "@/ui/toolbar/BottomBar";
import ZoomControl from "./ui/toolbar/ZoomControl";

const App = () => {
  return (
    <div className="app-shell">
      <div className="canvas-area">
        <CanvasRoot />
        <div className="ui-overlay">
          <TopBar />
          <BottomBar />
          <ZoomControl />
        </div>
      </div>
    </div>
  );
};

export default App;
