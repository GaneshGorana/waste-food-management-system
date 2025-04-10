import mongoose from "mongoose";
export const trackServiceWorkerChanges = (io) => {
    try {
        const donorCollection = mongoose.connection.collection("serviceworkers");

        const changeStream = donorCollection.watch();

        changeStream.on("change", (change) => {
            switch (change.operationType) {
                case "insert":
                    io.emit("serviceWorkerInserted", {
                        serviceWorkerId: change.fullDocument._id,
                        eventType: "INSERT"
                    });
                    break;

                case "update":
                    io.emit("serviceWorkerUpdated", {
                        serviceWorkerId: change.documentKey._id,
                        eventType: "UPDATE"
                    });
                    break;

                case "delete":
                    io.emit("serviceWorkerDeleted", {
                        serviceWorkerId: change.documentKey._id,
                        eventType: "DELETE"
                    });
                    break;

                default:
                    break;
            }
            io.emit("serviceWorkerDbChange", change);
        });

        changeStream.on("error", (error) => {
            console.log("Change Stream Error:", error);
        });
    } catch (error) {
        console.log("MongoDB replica set error.")
        console.log("Error tracking service worker changes:", error);
        return error
    }
};