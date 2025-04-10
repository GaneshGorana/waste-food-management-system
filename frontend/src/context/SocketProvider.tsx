import { useMemo } from "react";
import { io } from "socket.io-client";
import SocketContext from "./SocketContext.js";

interface SocketProviderProps {
  children: React.ReactNode;
}

export default function SocketProvider(props: SocketProviderProps) {
  const socket = useMemo(() => {
    return io(import.meta.env.VITE_BACKEND_ORIGIN_URL);
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
}
