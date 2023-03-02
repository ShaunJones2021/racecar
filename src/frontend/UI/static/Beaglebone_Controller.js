// Network Connection
var socket;
function init_networking() {
	socket = io.connect(null, {port: 5000, transports: ["websocket"], rememberTransport: false});
	socket.on('connect', function() {
		socket.emit('my event', {data: 'I\'m connected!'});
		window.addEventListener("gamepadconnected", (event) => {

			const controller = navigator.getGamepads()[event.gamepad.index]; //maintain a reference to controller

			//get controller information and display it to console
			console.log("Controller connected");
			controllerIndex = event.gamepad.index; //keep track of where controller is in gamepad array
    
			gameLoop();    
		});
	});
	socket.on("game_update", (arg) => {
		console.log(arg); // "world"
	});


}


let controllerIndex = null; //controller index in array of controllers
let raceStarted = false; //true if program has received start signal from RM, false otherwise
let raceFinished = false; //true if car has crossed finished line, false otherwises
let first_frame = true;

const ANALOG_RANGE = 2.00;

//variable to track analog positions from most recent animation frame
let prev_analog_positions = null; 



//TODO window.addEventListener for start signal from race management team
//window.addEventListener()


/* displays alert to the console when controller is disconnected*/
window.addEventListener("gamepaddisconnected", (event) => {

    console.log("Controller disconnected");
    controllerIndex = null; //indicates controller is no longer active

    //TODO send json object telling python program to stop car
});



//if < 2% change in analog stick -> return false
//if >= 2% change -> return true
function significantChanges(prev_analog_positions, current_axes){

    left_changes = getPercentDifference(prev_analog_positions[1], current_axes[1]) >= 0.10;
    right_changes = getPercentDifference(prev_analog_positions[2], current_axes[2]) >= 0.10;


    if(left_changes && !right_changes)
        return 1;
    else if(right_changes && !left_changes){
        return 2;
    }
    else if(right_changes && left_changes){
        return 3;
    }    
    return 0;
}


/*returns the percent difference between current and previous analog axes values*/
function getPercentDifference(x, y){

 
    return Math.abs(x-y) / ANALOG_RANGE;

    //return (x+1)-(y+1)

}


// //TODO add event that determines when analog stick positions have changed
// window.addEventListener("left_analog_update"), (event) => {

//     //check if left analog positions have changed since last animation frame OR

// }


// window.addEventListener("right_analog_update"), (event) => {

//     //check if left analog positions have changed since last animation frame OR

// }



//TODO put coordinates into a json object and send over to python program



/*this is the loop where we will be querying controller for useful information, 
and sending information to other programs.  Used ChatGpt assist with setting up gameloop*/
function gameLoop() {
   
    // Assuming only one gamepad is connected
    const game = navigator.getGamepads()[controllerIndex]; 

    //if the controller is connected
    if (controllerIndex != null) {

        if(first_frame){
            prev_analog_positions = game.axes;
            first_frame = false;
        }

        //update current axes
        var current_axes = game.axes;

        /* check to see if there were any significant changes in analog sticks since
        last animation frame */
        var left_right = significantChanges(prev_analog_positions, current_axes);
		
		if (left_right) {
			let js_ob = {"left": [current_axes[0], current_axes[1]], "right": [current_axes[2], current_axes[3]]};
			socket.emit('input', js_ob);
			prev_analog_positions = current_axes;
		}

      //DISPLAY analog stick positions to the console
      //TODO use this loop to update controller interface, don't send information from here
      
    }
  
    /*tells page to update information being displayed*/
    requestAnimationFrame(gameLoop);
  }
  
init_networking();
