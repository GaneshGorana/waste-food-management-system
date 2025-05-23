import express from "express"
import http from 'http';
import { Server } from 'socket.io';
import userAuthRoutes from './routes/userRoute.js'
import foodRoutes from './routes/foodRoute.js'
import dashboardRoutes from "./routes/dashboardRoute.js";
import serviceWorkeAuthRoutes from "./routes/serviceWorkerAuth.js";
import adminRoutes from "./routes/adminRoute.js";
import nearbyPlacesRoutes from "./routes/nearbyPlacesRoute.js";
import { configDotenv } from "dotenv";
import dbConnection from "./db/dbConnection.js";
import cors from "cors";
import { trackDonorChanges } from "./events/donorDbChangeEvents.js";
import { trackFoodChanges } from "./events/foodDbChangeEvents.js";
import getDataById from "./routes/getDataById.js";
import getCountById from "./routes/getCountById.js"
import refreshCookie from "./routes/refreshCookie.js"
import searchFilterTableRoutes from "./routes/searchFilterTableRoute.js"
import getAccountDataById from "./routes/getAccountDataById.js"
import { trackServiceWorkerChanges } from "./events/serviceWorkerDbChangeEvents.js";

// config and settings
configDotenv()

const app = express();
//cors
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))

app.get('/', (req, res) => {
    return res.json({ message: "API is working" })
})

//data decoding

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }
});

dbConnection().then(() => {
    trackDonorChanges(io);
    trackFoodChanges(io);
    trackServiceWorkerChanges(io);
    console.log('Database connected');
}).catch((err) => {
    console.log('Database connection error', err);
});
io.on('connection', (socket) => {
    socket.on("workerLocationUpdate", (data) => {
        socket.broadcast.emit("workerLocationUpdate", data);
    });

});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//routes
app.get('/', (req, res) => {
    res.json({ message: 'API is working' });
})
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/auth/service-worker', serviceWorkeAuthRoutes)
app.use('/api/auth/admin', adminRoutes);
app.use('/api/nearby-places', nearbyPlacesRoutes);
app.use('/api/refresh-cookie', refreshCookie);

app.use('/api/data', getDataById);
app.use('/api/count', getCountById);
app.use('/api/get-account-data', getAccountDataById);
app.use('/api/search-filter-table', searchFilterTableRoutes)

//server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

