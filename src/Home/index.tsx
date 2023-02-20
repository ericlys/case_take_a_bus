import {
  getCurrentPositionAsync,
  LocationAccuracy,
  LocationObject,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
} from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { customMapStyle, styles } from "./styles";
import customMarker from "../../assets/marker.png";

export default function Home() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [findStation, setFindStation] = useState(false);
  const { GOOGLE_KEY } = process.env;
  console.log(GOOGLE_KEY);

  const mapRef = useRef<MapView>(null);

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

  function handleFindStation() {
    setFindStation((prevState) => !prevState);
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          customMapStyle={customMapStyle}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            image={customMarker}
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          >
            <Image />
          </Marker>
        </MapView>
      )}
      <View style={styles.content}>
        <TouchableOpacity
          style={!findStation ? styles.findButtonTrue : styles.findButtonFalse}
          onPress={handleFindStation}
        >
          <Text style={styles.buttonText}>
            {!findStation ? "Ligar" : "Desligar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
