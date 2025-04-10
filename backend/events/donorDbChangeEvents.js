import mongoose from "mongoose";
export const trackDonorChanges = (io) => {
    try {
        const donorCollection = mongoose.connection.collection("users");

        const changeStream = donorCollection.watch();

        changeStream.on("change", (change) => {
            switch (change.operationType) {
                case "insert":
                    io.emit("donorInserted", {
                        donorId: change.fullDocument._id,
                        eventType: "INSERT"
                    });
                    break;

                case "update":
                    io.emit("donorUpdated", {
                        donorId: change.documentKey._id,
                        eventType: "UPDATE"
                    });
                    break;

                case "delete":
                    io.emit("donorDeleted", {
                        donorId: change.documentKey._id,
                        eventType: "DELETE"
                    });
                    break;

                default:
                    break;
            }
            io.emit("donorDbChange", change);
        });

        changeStream.on("error", (error) => {
            console.log("Change Stream Error:", error);
        });
    } catch (error) {
        console.log("MongoDB replica set error.")
        console.log("Error tracking donor changes:", error);
        return error
    }
};