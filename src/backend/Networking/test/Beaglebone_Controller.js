let controllerPosition = null; //controller index in array of controllers
let rightAnalog; //position of right analog stick [-1,1]
let leftAnalog; //postition of left analog stick [-1, 1]

/* displays alert to the console when controller is connected
or if controller is already connected when this page loads in browser*/
window.addEventListener("gamepadconnected", (event) => {

    const controller = navigator.getGamepads()[event.gamepad.index]; //maintain a reference to controller

    //get controller information and display it to console
    console.log("Controller connected: at index %d with id %s\nController has %d buttons and %d axes",
        event.gamepad.index, event.gamepad.id,
        event.gamepad.buttons, event.gamepad.axes);
    controllerPosition = event.gamepad.index; //keep track of where controller is in gamepad array

    //gameLoop();
});

/* displays alert to the console when controller is disconnected*/
window.addEventListener("gamepaddisconnected", (event) => {

    console.log("Controller disconnected: at index %d with id %s", event.gamepad.index, event.gamepad.id);
    controllerPosition = null; //indicate controller is no longer active

});

/*this is the loop where we will be querying controller for useful information, 
and sending information to other programs*/
function gameLoop() {


}