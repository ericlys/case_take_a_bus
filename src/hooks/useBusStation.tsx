import axios from "axios";
import {
  getCurrentPositionAsync,
  LocationAccuracy,
  LocationObject,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
} from "expo-location";
import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import MapView from "react-native-maps";

interface busStationsResponseProps {
  place_id: string;
  name: string;
  business_status: string;
  geometry: { location: { lat: number; lng: number } };
}

interface busStationsProps {
  id: string;
  name: string;
  status: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface BusStationContextData {
  isActiveStationSearch: boolean;
  isFetchBusStation: boolean;
  setIsActiveStationSearch: (state: boolean) => void;
  location: LocationObject | null;
  mapRef: RefObject<MapView>;
  busStations: busStationsProps[];
}

interface BusStationProviderData {
  children: ReactNode;
}

const BusStationContext = createContext({} as BusStationContextData);

const googleEndpoint =
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

function BusStationProvider({ children }: BusStationProviderData) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [isActiveStationSearch, setIsActiveStationSearch] = useState(false);
  const [isFetchBusStation, setIsFetchBusStation] = useState(false);
  const [busStations, setBusStations] = useState<busStationsProps[]>([]);
  const mapRef = useRef<MapView>(null);

  //============= location and permissions =========
  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync();

    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
    }
  }

  useEffect(() => {
    requestLocationPermissions();
  }, []);

  useEffect(() => {
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (response) => {
        setLocation(response);
        mapRef.current?.animateCamera({
          pitch: 30,
          center: response.coords,
        });
      }
    );
  }, []);
  //=====================

  //============= search bus stations =========
  const fetchStations = useCallback(async () => {
    try {
      if (isActiveStationSearch) {
        setIsFetchBusStation(true);

        const formatedLocation = `${location?.coords.latitude},${location?.coords.longitude}`;
        const radius = 1000; //1km // search radius in meters
        const type = "bus_station"; // type of place
        const apiKey = process.env.GOOGLE_KEY;

        const placeUrl =
          googleEndpoint +
          `?location=${formatedLocation}` +
          `&radius=${radius}` +
          `&type=${type}` +
          `&key=${apiKey}`;

        const response = await axios.get(placeUrl);

        const busStations: busStationsResponseProps[] = response.data.results;

        const busStationsFormatted = busStations.map((station) => {
          return {
            id: station.place_id,
            name: station.name,
            status: station.business_status,
            coordinates: station.geometry.location,
          };
        });

        setBusStations(busStationsFormatted);
      }
    } catch (error) {
      console.error(error);
      setIsActiveStationSearch(false);
      throw new Error();
    } finally {
      setIsFetchBusStation(false);
    }
  }, [isActiveStationSearch, location]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    if (!isActiveStationSearch) {
      setBusStations([]);
    }
  }, [isActiveStationSearch]);

  //=====================

  return (
    <BusStationContext.Provider
      value={{
        isActiveStationSearch,
        isFetchBusStation,
        setIsActiveStationSearch,
        location,
        mapRef,
        busStations,
      }}
    >
      {children}
    </BusStationContext.Provider>
  );
}

function useBusStation() {
  const context = useContext(BusStationContext);

  return context;
}

export { BusStationProvider, useBusStation };
