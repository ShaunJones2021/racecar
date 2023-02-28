let controllerIndex = null; //controller index in array of controllers
let raceStarted = false; //true if program has received start signal from RM, false otherwise
let raceFinished = false; //true if car has crossed finished line, false otherwises


let leftAnalogX = 0;
let leftAnalogY = 0;
let rightAnalogX = 0;
let rightAnalogY = 0;

//let rightAnalog; //position of right analog stick [-1,1]
//let leftAnalog; //position of left analog stick [-1, 1]

/* displays alert to the console when controller is connected
or if controller is already connected when this page loads in browser*/
window.addEventListener("gamepadconnected", (event) => {

    const controller = navigator.getGamepads()[event.gamepad.index]; //maintain a reference to controller

    //get controller information and display it to console
    console.log("Controller connected");
    controllerIndex = event.gamepad.index; //keep track of where controller is in gamepad array
    gameLoop();

    
});



//TODO window.addEventListener for start signal from race management team
window.addEventListener()



/* displays alert to the console when controller is disconnected*/
window.addEventListener("gamepaddisconnected", (event) => {

    console.log("Controller disconnected");
    controllerIndex = null; //indicates controller is no longer active

});


//TODO function here!
//if < 5% change in analog stick -> return false
//if >= 5% change -> return true




//TODO add event that determines when analog stick positions have changed
window.addEventListener("left_analog_update"), (event) => {

    //check if left analog positions have changed since last animation frame OR

}


window.addEventListener("right_analog_update"), (event) => {

    //check if left analog positions have changed since last animation frame OR

}



//TODO put coordinates into a json object and send over to python program



/*this is the loop where we will be querying controller for useful information, 
and sending information to other programs.  Used ChatGpt assist with setting up gameloop*/
function gameLoop() {
   
    // Assuming only one gamepad is connected
    const game = navigator.getGamepads()[controllerIndex]; 
  
    //if the controller is connect
    if (controllerIndex != null) {
      const [leftX, leftY, rightX, rightY] = game.axes;
  
      //DISPLAY analog stick positions to the console
      //console.log(`Left Analog Stick: (${leftX}, ${leftY})`);
      //console.log(`Right Analog Stick: (${rightX}, ${rightY})`);    
    

      //TODO use this loop to update controller interface, don't send information from here
      
    }
  
    /*tells page to update information being displayed*/
    requestAnimationFrame(gameLoop);
  }