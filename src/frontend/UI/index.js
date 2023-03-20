/* Credits:
 * -Used Chat GPT to assist with setting up gameloop 
 * -Used YouTube tutorials by Chris Courses to learn how to use Canvas
 * //TODO add Youtube Gamepad API video
*/


/*VARIABLES RELATED TO CONTROLLER INPUT/COMMUNICATING WITH RACE MANAGEMENT*/

var controllerIndex = null; //controller index in array of controllers
var raceStarted = false; //true if program has received start signal from RM, false otherwise
var raceFinished = false; //true if car has crossed finished line, false otherwises
var first_frame = true; //true if gameloop is in first frames
var left_stick_shift, right_stick_shift = 0; //variables representing x shift for left analog, y shift for right analog
const ANALOG_RANGE = 2.00; //constant representing range of possible values for an analog stick
var prev_analog_positions = null; //variable to track analog positions from most recent animation frame


/*VARIABLES FOR POSITIONING CANVAS ELEMENTS*/

var a_guage_x, a_guage_y = 0; //x and y coordinates of acceleration guage
var a_guage_height, a_guage_width = 0; //height and width of acceleration guage

var d_guage_x, d_guage_y = 0; //x and y coordinates of directional guage
var d_guage_height, d_guage_width = 0; //height and width of directional guage

var on_off_x, on_off_y, on_off_radius = 0; //x/y coordinates and radius of engine on button
var engine_on_off = false;

var a_ind_y, d_ind_x = 0; //y position of acceleration indicator and x position of directional indicator
var a_mid, d_mid = 0; //midpoints of acceleration and directional guages

var canvas = document.querySelector('canvas'); //stores information about canvas html elements

/* stands for context, helps us resize/reposition canvas (super objects)
* BASIC PREMISE: Making SuperObject! -> taking a lot of methods/functions to implement a dynamic panel to draw shapes (2d) on*/
var c = canvas.getContext('2d');



/*--------------------------------------------------CODE THAT DOES STUFF--------------------------------------------------------------*/



/*UI initial setup*/

updatePanel(); //display interface in default position
center_a_ind();
center_d_ind();
c.lineWidth = 5; //make lines thick enough to see clearly


/* displays alert to the console when controller is connected
or if controller is already connected when this page loads in browser*/
window.addEventListener("gamepadconnected", (event) => {

    //maintain a reference to controller throughout program's lifecycle
    const controller = navigator.getGamepads()[event.gamepad.index]; 

    //get controller information and display it to console
    console.log("Controller connected");

    //set engine button to be on
    engine_on_off = true;
    
    //keep track of where controller is in gamepad array
    controllerIndex = event.gamepad.index;

    //call gameLoop function to begin reading controller analog stick input
    gameLoop();
});


//TODO window.addEventListener for start signal from race management team
//window.addEventListener()

//TODO window.addEventListener for stop signal from controller/race management


/*dynamically updates canvas and contents based on window size*/
function updatePanel(){

    //makes canvas fill entire screen (can create variables to store and update inside gameloop) 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    position_a_guage();
    position_d_guage();
    display_a_midpoint();
    display_d_midpoint();
    position_on_off();
}

function position_on_off() {

    //position button above and between both guages
    on_off_x = d_guage_x; 
    on_off_y = a_guage_y + - (a_guage_y * 0.25);
    on_off_radius = window.innerHeight/12;

    if(!engine_on_off){
        c.strokeStyle = "darkred";
        c.fillStyle = "darkred";
    }
    else{
        c.strokeStyle = "green";
        c.fillStyle = "green";
    }

    //create arc between 0 and 2pi radians (circle) at (on_off_x, on_off_y)
    c.beginPath();
    c.arc(on_off_x, on_off_y, on_off_radius, 0, Math.PI * 2, false);

    //draw and fill in the circle
    c.stroke();    
    c.fill();

    //do some funky stuff to make text go in middle of circle
    c.fillStyle = "white";
    c.font = (on_off_radius*0.33).toString() + "px Trebuchet MS";

    if(!engine_on_off){
        c.fillText("Engine Off", on_off_x - (on_off_radius)/1.4, on_off_y + (on_off_radius/7));   
    }
    else {
        c.fillText("Engine On", on_off_x - (on_off_radius)/1.4, on_off_y + (on_off_radius/7));   
    }
    
}

/*positions acceleration guage within canvas*/
function position_a_guage() {

    a_guage_x = window.innerWidth/2;
    a_guage_y = window.innerHeight/2.25;

    //1:3 rectangle
    a_guage_width = window.innerHeight * 0.15;
    a_guage_height = window.innerHeight * 0.45; 

    c.fillStyle = "black";
    c.fillRect(a_guage_x, a_guage_y, a_guage_width, a_guage_height);
}

/*positions directional guage within canvas*/
function position_d_guage() {

    //position directional guage next to acceleration guage with seperating whitespace
    d_guage_x = a_guage_x + (window.innerHeight * 0.175);

    //position directional gauge perpendicular to acceleration guage
    d_guage_y = a_guage_y + (window.innerHeight * 0.3);

    //3:1 rectangle
    d_guage_width = window.innerHeight * 0.45;
    d_guage_height = window.innerHeight * 0.15; 

    c.fillStyle = "black";
    c.fillRect(d_guage_x, d_guage_y, d_guage_width, d_guage_height);
}


/* Adjusts position acceleration indicator within the acceleration
* after a significant change is detected from the left analog stick.
*/
function position_a_indicator(shift, y){

    //start drawing line
    c.beginPath();
    
    // if no movement -> set the bar at middle
    if((y <= 0.004) && (y >= - 0.004)){
        center_a_ind();
    }
   
    //move bar based on previous frame
    a_ind_y += (shift * a_guage_height); 
     
    //if(y< upperbound) -> keep the bar at the top pos
    if(a_ind_y <= a_guage_y) {
        a_ind_y = a_guage_y;
    }
    //else if(y> lowerbound)-> keep the bar at the bottom pos
    else if(a_ind_y >= a_guage_y + a_guage_height){
        a_ind_y = a_guage_y + (a_guage_height);
    }
   
    c.moveTo(a_guage_x, a_ind_y); //where line starts (FIXME a_gauge MIDPOINT)
    c.lineTo(a_guage_x + a_guage_width, a_ind_y); //where line ends (FIXME a_guage MIDPOINT)
    c.strokeStyle = "lightgreen"; //set line color to light green
    c.lineWidth = 5; //make lines thick enough to see clearly
    c.stroke(); //fill in line
}

/*display midpoint of acceleration guage*/
function display_a_midpoint(){

    c.beginPath();
    a_mid = a_guage_y + (a_guage_height/2);
    c.moveTo(a_guage_x, a_mid); //where line starts (FIXME a_gauge MIDPOINT)
    c.lineTo(a_guage_x + a_guage_width, a_mid); //where line ends (FIXME a_guage MIDPOINT)
    c.strokeStyle = "white"; //set line color to light green
    c.lineWidth = 5; //make lines thick enough to see clearly
    c.stroke(); //fill in line
}

function display_d_midpoint(){

    c.beginPath();
    d_mid = d_guage_x + (d_guage_width/2); 
    c.moveTo(d_mid, d_guage_y); //where line starts (FIXME a_gauge MIDPOINT)
    c.lineTo(d_mid, d_guage_y + d_guage_height); //where line ends (FIXME a_guage MIDPOINT)
    c.strokeStyle = "white"; //set line color to light green
    c.lineWidth = 5; //make lines thick enough to see clearly
    c.stroke(); //fill in line

}


/* Adjusts position acceleration indicator within the acceleration
* after a significant change is detected from the left analog stick.
*/
function position_d_indicator(shift, x){

    c.beginPath();
    
    // if no movement -> set the bar at middle
    if((x <= 0.004) && (x >= - 0.004)){
        center_d_ind();
    }
   
    //move bar based on previous frame
    d_ind_x += (shift * d_guage_width); 
     
    //if(x > upperbound) -> keep indicator at the right
    if(d_ind_x >= d_guage_x + d_guage_width) {
        d_ind_x = d_guage_x + d_guage_width;
    }
    //else if(x < lowerbound)-> keep the bar at the bottom pos
    else if(d_ind_x <= d_guage_x){
        d_ind_x = d_guage_x;
    }
   
    c.moveTo(d_ind_x, d_guage_y); //where line starts (FIXME a_gauge MIDPOINT)
    c.lineTo(d_ind_x, d_guage_y + d_guage_height); //where line ends (FIXME a_guage MIDPOINT)
    c.strokeStyle = "lightgreen"; //set line color to light green
    c.lineWidth = 5; //make lines thick enough to see clearly
    c.stroke(); //draw line
}


/* displays alert to the console when controller is disconnected*/
window.addEventListener("gamepaddisconnected", (event) => {

    console.log("Controller disconnected");
    controllerIndex = null; //indicates controller is no longer active
    engine_on_off = false;

    //TODO send json object telling python program to stop car ("STOP")
});


//if < 10% change in analog stick -> return false
//if >= 10% change -> return true
function significantChanges(prev_analog_positions, current_axes) {

    left_changes = getPercentDifferenceAbs(current_axes[1], prev_analog_positions[1]) >= 0.10;
    right_changes = getPercentDifferenceAbs(current_axes[2], prev_analog_positions[2]) >= 0.10;

    if (left_changes && !right_changes) {
        return 1;
    }
    else if (right_changes && !left_changes) {
        return 2;
    }
    else if (right_changes && left_changes) {
        return 3;
    }
    return 0;
}

/*tracks changes in current analog sticks' position relative to previous analog sticks' position (positive or negative)*/
function getPercentDifferenceAbs(x, y) {

    return Math.abs(x - y) / ANALOG_RANGE;
}

/* tracks changes in current analog sticks' position relative to previous analog sticks' position (positive or negative).
* Used to adjust acceleration and directional indicators
*/
function getPercentDifference(x, y) {

    return  (x - y) / ANALOG_RANGE;
}

//TODO send json object over to python program

/*puts acceleration indicator in the middle of acceleration guage*/
function center_a_ind(){
    a_ind_y = a_guage_y + (a_guage_height/2); //initialize acceleration indicator to be in middle of a_guage
}

/*puts directional indicator in the middle of acceleration guage*/
function center_d_ind(){
    d_ind_x = d_guage_x + (d_guage_width/2);    
} 


/*this is the loop where we will be querying controller for useful information, 
and sending information to other programs.  Used ChatGpt assist with setting up gameloop*/
function gameLoop() {

    //we are ssuming only one gamepad is connected to the computer
    const game = navigator.getGamepads()[controllerIndex];

    //update context
    c = canvas.getContext('2d');

    //update guage positions
    updatePanel();
    
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
            console.log(jsonString);
        }

        else if (left_right == 2) {

            //package right analog stick data into json object
            const jsonString = JSON.stringify("R:" + current_axes[2] + ", " + current_axes[3]);
            console.log(jsonString);
        }

        else if (left_right == 3) {

            //TODO package into a single json object
            //package analog data into json objects
            const jsonString1 = JSON.stringify("L:" + current_axes[0] + ", " + current_axes[1]);
            const jsonString2 = JSON.stringify("R:" + current_axes[2] + ", " + current_axes[3]);
            console.log(jsonString1);
            console.log(jsonString2);
        }

        left_stick_shift = getPercentDifference(current_axes[1], prev_analog_positions[1]);
        right_stick_shift = getPercentDifference(current_axes[2], prev_analog_positions[2]);        
      
        position_a_indicator(left_stick_shift, current_axes[1]);
        position_d_indicator(right_stick_shift, current_axes[2]); 

        //update prev stick positions
        prev_analog_positions = current_axes;

        //DISPLAY analog stick positions to the console
        //TODO use this loop to update controller interface, don't send information from here
    }

    /*tells page to update information being displayed*/
    requestAnimationFrame(gameLoop);
}