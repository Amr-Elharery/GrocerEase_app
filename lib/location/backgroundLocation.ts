 import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { sendLocation } from "./locationSocket";


const TASK_NAME = "DELIVERY_TASK";


TaskManager.defineTask(
  TASK_NAME,
  ({ data, error }) => {

    if (error) {
      console.log(error);
      return;
    }


    if (data) {

      const { locations } = data as any;

      const location = locations[0];


      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };


      console.log(
        "Background location:",
        coords
      );


      // send location through websocket
      sendLocation(coords);

    }
  }
);



export async function startBackgroundLocation(){


 const {status} =
 await Location.requestForegroundPermissionsAsync();


 if(status !== "granted"){
   console.log("Foreground permission denied");
   return;
 }



 const bg =
 await Location.requestBackgroundPermissionsAsync();


 if(bg.status !== "granted"){
   console.log("Background permission denied");
   return;
 }



 await Location.startLocationUpdatesAsync(
   TASK_NAME,
   {

    accuracy:
    Location.Accuracy.High,


    timeInterval:5000,


    distanceInterval:0,


    foregroundService:{

      notificationTitle:
      "Tracking delivery",


      notificationBody:
      "Location running"

    }

   }
 );

}