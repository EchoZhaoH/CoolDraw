import "./App.css";
import CanvasRoot from "@/ui/components/CanvasRoot";
import BottomBar from "@/ui/toolbar/BottomBar";
import LeftToolbar from "@/ui/toolbar/LeftToolbar";
import RightToolbar from "@/ui/toolbar/RightToolbar";
import TopBar from "@/ui/toolbar/TopBar";
import TopRightBar from "@/ui/toolbar/TopRightBar";
import BottomLeftBar from "@/ui/toolbar/BottomLeftBar";
import BottomRightBar from "@/ui/toolbar/BottomRightBar";

const App = () => {
  return (
    <div className="app-shell">
      <div className="canvas-area">
        <CanvasRoot />
        <TopBar />
        <TopRightBar />
        <LeftToolbar />
        <RightToolbar />
        <BottomLeftBar />
        <BottomBar />
        <BottomRightBar />
      </div>
    </div>
  );
};

export default App;
