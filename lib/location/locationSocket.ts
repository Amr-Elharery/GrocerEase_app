let socket: WebSocket | null = null;



export function connectLocationSocket(
 deliveryId:string,
 jwt:string
){


 const URL =
 `WS_URL/ws/delivery/${deliveryId}?token=${jwt}`;



 socket = new WebSocket(URL);



 socket.onopen=()=>{
   console.log(
   "socket connected"
   );
 }



 socket.onclose=()=>{

   console.log(
   "reconnecting..."
   );


   setTimeout(()=>{

    connectLocationSocket(
      deliveryId,
      jwt
    );

   },2000);

 }



 return socket;

}



export function sendLocation(
 coords:any
){

 if(
 socket &&
 socket.readyState===WebSocket.OPEN
 ){

 socket.send(
 JSON.stringify({
   latitude:
   coords.latitude,

   longitude:
   coords.longitude
 })
 );

 }

}