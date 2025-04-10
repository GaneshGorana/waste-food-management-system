import mongoose from "mongoose";
export const trackFoodChanges = (io) => {
    try {
        const foodCollection = mongoose.connection.collection("foods");

        const changeStream = foodCollection.watch();

        changeStream.on("change", (change) => {
            switch (change.operationType) {
                case "insert":
                    io.emit("foodInserted", {
                        foodId: change.fullDocument._id,
                        eventType: "INSERT"
                    });
                    break;

                case "update":
                    io.emit("foodUpdated", {
                        foodId: change.documentKey._id,
                        eventType: "UPDATE"
                    });
                    break;

                case "delete":
                    io.emit("foodDeleted", {
                        foodId: change.documentKey._id,
                        eventType: "DELETE"
                    });
                    break;

                default:
                    break;
            }
            io.emit("foodDbChange", change);
        });

        changeStream.on("error", (error) => {
            console.log("Change Stream Error:", error);
        });
    } catch (error) {
        console.log("MongoDB replica set error.")
        console.log("Error tracking food changes:", error);
        return error
    }
};