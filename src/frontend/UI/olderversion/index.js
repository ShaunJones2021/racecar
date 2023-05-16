let controllerIndex = null; //controller index in array of controllers
let raceStarted = false; //true if program has received start signal from RM, false otherwise
let raceFinished = false; //true if car has crossed finished line, false otherwises
let first_frame = true;
let acceleration_indicator = document.getElementsByClassName("acceleration_indicator");
let directional_indicator = document.getElementsByClassName("directional_indicator"); 
let acceleration_indicator_height = null;
let directional_indicator_direction = null;

const ANALOG_RANGE = 2.00;

//variable to track analog positions from most recent animation frame
let prev_analog_positions = null;


/* displays alert to the console when controller is connected
or if controller is already connected when this page loads in browser*/
window.addEventListener("gamepadconnected", (event) => {

    const controller = navigator.getGamepads()[event.gamepad.index]; //maintain a reference to controller

    //get controller information and display it to console
    console.log("Controller connected");
    controllerIndex = event.gamepad.index; //keep track of where controller is in gamepad array

    gameLoop();
});


/*window.addEventListener("accelerationinput", (event) => {

    acceleration_indicator = document.getElementsByClassName("acceleration_indicator");    
});



window.addEventListener("accelerationinput", (event) => {

    directional_indicator = document.getElementsByClassName("directional_indicator");    
});*/

//TODO window.addEventListener for start signal from race management team
//window.addEventListener()


/* displays alert to the console when controller is disconnected*/
window.addEventListener("gamepaddisconnected", (event) => {

    console.log("Controller disconnected");
    controllerIndex = null; //indicates controller is no longer active

    //TODO send json object telling python program to stop car
});



//if < 10% change in analog stick -> return false
//if >= 10% change -> return true
function significantChanges(prev_analog_positions, current_axes) {

    left_changes = getPercentDifferenceAbs(current_axes[1], prev_analog_positions[1]) >= 0.10;
    right_changes = getPercentDifferenceAbs(current_axes[2], prev_analog_positions[2]) >= 0.10;

    if (left_changes && !right_changes)
        return 1;
    else if (right_changes && !left_changes) {
        return 2;
    }
    else if (right_changes && left_changes) {
        return 3;
    }
    return 0;
}


/*returns the percent difference between current and previous analog axes values*/
function getPercentDifferenceAbs(x, y) {


    return Math.abs(x - y) / ANALOG_RANGE;

}

function getPercentDifference(x, y) {

    return Math(x - y) / ANALOG_RANGE;

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

        //read initial input
        if (first_frame) {
            prev_analog_positions = game.axes;
            first_frame = false;
        }

        //update current axes
        var current_axes = game.axes;

        /* check to see if there were any significant changes in analog sticks since
        last animation frame */
        var left_right = significantChanges(prev_analog_positions, current_axes);

        //if there are significant changes in analog positions, display update to screen
        if (left_right == 1) {

            //package left analog stick data into json object
            const jsonString = JSON.stringify("L:" + current_axes[0] + ", " + current_axes[1]);
           
            //update acceleration indicator
            acceleration_indicator = document.getElementsByClassName("acceleration_indicator"); 
            acceleration_indicator_height = acceleration_indicator.style.marginTop;
            const diff = getPercentDifference(current_axes[1], prev_analog_positions[1]) >= 0.10;

            if(diff > 0){
                acceleration_indicator_height -= diff * 300;
            }
            else {
                acceleration_indicator_height += diff * 300;
            }

            acceleration_indicator.style.marginTop = acceleration_indicator_height + "%";
            
            //move html acceleration indicator
            console.log(jsonString);
        }
        else if (left_right == 2) {

            //package right analog stick data into json object
            const jsonString = JSON.stringify("R:" + current_axes[2] + ", " + current_axes[3]);
            console.log(jsonString);



            directional_indicator = document.getElementsByClassName("directional_indicator"); 
            directional_indicator_direction = directional_indicator.style.marginLeft;
            const diff = getPercentDifference(current_axes[2], prev_analog_positions[2]) >= 0.10;

            if(diff > 0){
                directional_indicator_direction -= diff * 100;
            }
            else {
                directional_indicator_direction += diff * 100;
            }

            directional_indicator.style.marginLeft = directional_indicator_direction + "%";
            //move html directional indicator
        }
        else if (left_right == 3) {

            //TODO package into a single json object
            //package analog data into json objects
            const jsonString1 = JSON.stringify("L:" + current_axes[0] + ", " + current_axes[1]);
            const jsonString2 = JSON.stringify("R:" + current_axes[2] + ", " + current_axes[3]);
            console.log(jsonString1);
            console.log(jsonString2);

            //move both html indicators 
        }

        prev_analog_positions = current_axes;
        //DISPLAY analog stick positions to the console
        //TODO use this loop to update controller interface, don't send information from here
    }

    /*tells page to update information being displayed*/
    requestAnimationFrame(gameLoop);
}