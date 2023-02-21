import { BusStationProvider } from "./src/hooks/useBusStation";
import Home from "./src/screens/Home";

export default function App() {
  return (
    <BusStationProvider>
      <Home />
    </BusStationProvider>
  );
}
