import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { customMapStyle, styles } from "./styles";
import customMarkerImage from "../../../assets/marker.png";
import busStationImage from "../../../assets/busStation.png";
import { useBusStation } from "../../hooks/useBusStation";

export default function Home() {
  const {
    isActiveStationSearch,
    isFetchBusStation,
    setIsActiveStationSearch,
    location,
    mapRef,
    busStations,
  } = useBusStation();

  function handleFindStation() {
    setIsActiveStationSearch(!isActiveStationSearch);
  }

  return (
    <View style={styles.container}>
      {location ? (
        <>
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
              image={customMarkerImage}
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
            />
            {busStations.map((busStaion) => {
              return (
                <Marker
                  key={busStaion.id}
                  image={busStationImage}
                  title={busStaion.name}
                  coordinate={{
                    latitude: busStaion.coordinates.lat,
                    longitude: busStaion.coordinates.lng,
                  }}
                />
              );
            })}
          </MapView>

          <View style={styles.content}>
            <TouchableOpacity
              style={
                !isActiveStationSearch
                  ? styles.findButtonTrue
                  : styles.findButtonFalse
              }
              onPress={handleFindStation}
            >
              {isFetchBusStation ? (
                <ActivityIndicator size={30} color={"#fff"} />
              ) : (
                <Text style={styles.buttonText}>
                  {!isActiveStationSearch ? "Ligar" : "Desligar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <Image source={customMarkerImage} />
          <Text style={styles.text}>
            App precisa ter acesso a sua localização
          </Text>
        </View>
      )}
    </View>
  );
}
