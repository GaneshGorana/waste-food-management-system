import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSocket } from "../hooks/useSocket";
import axios from "axios";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import mapError from "../assets/map_error.png";
import foodIcon from "../assets/food_icon.png";
import serviceWorkerIcon from "../assets/service_worker_icon.png";

type Coordinates = {
  lat: number;
  lng: number;
};

const Routing = ({ from, to }: { from: Coordinates; to: Coordinates }) => {
  const map = useMap();
  const routingControlRef = useRef<ReturnType<typeof L.Routing.control> | null>(
    null
  );

  useEffect(() => {
    if (!map) return;

    if (!routingControlRef.current) {
      routingControlRef.current = L.Routing.control({
        waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
      }).addTo(map);
    } else {
      routingControlRef.current.setWaypoints([
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng),
      ]);
    }

    return () => {
      // Optional cleanup on unmount
      // map.removeControl(routingControlRef.current!);
    };
  }, [from.lat, from.lng, to.lat, to.lng, map]);

  return null;
};

const TrackFood = () => {
  const socket = useSocket();
  const { search } = useLocation();

  const [destinationLocation, setDestinationLocation] =
    useState<Coordinates | null>(null);
  const [workerLocation, setWorkerLocation] = useState<Coordinates | null>(
    null
  );
  const [workerName, setWorkerName] = useState<string>("");
  const [destinationLabel, setDestinationLabel] = useState<string>("");

  const getCoordinatesFromAddress = async (
    address: string
  ): Promise<Coordinates | null> => {
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: address,
            format: "json",
            limit: 1,
          },
        }
      );
      const loc = res.data[0];
      return loc
        ? { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) }
        : null;
    } catch (error) {
      console.error("Geocoding failed:", error);
      return null;
    }
  };

  const workingFunction = useCallback(async () => {
    const queryParams = new URLSearchParams(search);
    const mode = queryParams.get("mode") || "pickup";
    const serviceWorkerId = queryParams.get("workerId");

    if (!serviceWorkerId) {
      console.error("Service worker ID is missing in the URL.");
      return;
    }

    const { data } = await axios.post(
      `${
        import.meta.env.VITE_BACKEND_ORIGIN_URL
      }/api/get-account-data/service-worker`,
      { _id: serviceWorkerId },
      { withCredentials: true }
    );

    const workerLat = data.data?.latitude;
    const workerLng = data.data?.longitude;
    const worker = data.data?.name || "Service Worker";
    setWorkerLocation({ lat: workerLat, lng: workerLng });
    setWorkerName(worker);

    if (mode === "pickup") {
      const foodLat = parseFloat(queryParams.get("foodLat") || "");
      const foodLng = parseFloat(queryParams.get("foodLng") || "");
      const foodSource = queryParams.get("foodSource") || "Food Location";
      setDestinationLocation({ lat: foodLat, lng: foodLng });
      setDestinationLabel(foodSource);
    } else if (mode === "delivery") {
      const deliveryAddress = queryParams.get("deliveryAddress");
      if (!deliveryAddress) {
        console.error("Missing delivery address for delivery mode.");
        return;
      }
      const coords = await getCoordinatesFromAddress(deliveryAddress);
      if (coords) {
        setDestinationLocation(coords);
        setDestinationLabel(deliveryAddress);
      } else {
        console.error("Failed to get coordinates for delivery address.");
      }
    }
  }, [search]);

  useEffect(() => {
    workingFunction();
  }, [workingFunction]);

  const handleLocationUpdate = (data: {
    lat: number;
    lng: number;
    workerId: string;
    workerName: string;
  }) => {
    setWorkerLocation({ lat: data.lat, lng: data.lng });
  };

  useEffect(() => {
    socket?.on("workerLocationUpdate", handleLocationUpdate);
    return () => {
      socket?.off("workerLocationUpdate", handleLocationUpdate);
    };
  }, [socket]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tracking Food</h1>

      {!destinationLocation || !workerLocation ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <img
            src={mapError}
            alt="Map Error"
            className="w-32 h-32 opacity-60"
          />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Unable to load map data
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            We're having trouble loading the food or worker location.
            <br />
            Please check your network or try again later.
          </p>
        </div>
      ) : (
        <MapContainer
          center={destinationLocation}
          zoom={13}
          scrollWheelZoom={true}
          className="h-[80vh] w-full rounded-md z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <Marker
            key={`dest-${destinationLocation.lat}-${destinationLocation.lng}`}
            position={destinationLocation}
            icon={L.icon({ iconUrl: foodIcon, iconSize: [32, 32] })}
            title="Destination"
          >
            <Popup>{destinationLabel}</Popup>
          </Marker>

          <Marker
            key={`worker-${workerLocation.lat}-${workerLocation.lng}`}
            position={workerLocation}
            icon={L.icon({ iconUrl: serviceWorkerIcon, iconSize: [32, 32] })}
            title="Service Worker Location"
          >
            <Popup>{workerName}</Popup>
          </Marker>

          <Routing from={workerLocation} to={destinationLocation} />
        </MapContainer>
      )}
    </div>
  );
};

export default TrackFood;
