import * as L from "leaflet";

declare module "leaflet" {
  namespace Routing {
    interface RoutingControlOptions extends L.ControlOptions {
      waypoints: L.LatLng[];
      router?: unknown;
      plan?: unknown;
      routeWhileDragging?: boolean;
      autoRoute?: boolean;
      useZoomParameter?: boolean;
      show?: boolean;
      addWaypoints?: boolean;
      draggableWaypoints?: boolean;
      fitSelectedRoutes?: boolean;
    }

    function control(options: RoutingControlOptions): L.Routing.Control;
  }
}
