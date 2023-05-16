/* Credits:
 * -Used Chat GPT to assist with setting up gameloop 
 * -Used YouTube tutorials by Chris Courses to learn how to use Canvas
 * -Used Coding with Adam Youtube Channel to learn how to integrate Gamepad API with UI
*/


/*VARIABLES RELATED TO CONTROLLER INPUT/COMMUNICATING WITH RACE MANAGEMENT*/

var controllerIndex = null; //controller index in array of controllers
var start_signal = false; //true if program has received start signal from RM, false otherwise
var stop_signal = false; //true if car has recieved stop signal from RM, false otherwise
var first_frame = true; //true if gameloop is in first frames
var left_stick_shift, right_stick_shift = 0; //variables representing x shift for left analog, y shift for right analog
const ANALOG_RANGE = 2.00; //constant representing range of possible values for an analog stick
var prev_analog_positions = null; //variable to track analog positions from most recent animation frame

/*VARIABLES FOR POSITIONING CANVAS ELEMENTS*/

var a_outline_x, a_outline_y = 0; //x and y coordinates of acceleration gauge outline
var a_outline_height, a_outline_width = 0; //height and width of acceleration gauge outline

var d_outline_x, d_outline_y = 0; //x and y coordinates of directional gauge outline
var d_outline_height, d_outline_width = 0; //height and width of directional gauge outline

var on_off_x, on_off_y, on_off_radius = 0; //x/y coordinates and radius of engine on button
var engine_on_off = false;

var a_ind_y, d_ind_x = 0; //y position of acceleration indicator and x position of directional indicator
var a_mid, d_mid = 0; //midpoints of acceleration and directional guages

var ind_width = 0; //width of indicator line

var canvas = document.querySelector('canvas'); //stores information about canvas html elements

/* stands for context, helps us resize/reposition canvas (super objects)
* BASIC PREMISE: Making SuperObject! -> taking a lot of methods/functions to implement a dynamic panel to draw shapes (2d) on*/
var c = canvas.getContext('2d');


/*--------------------------------------------------CODE THAT DOES STUFF--------------------------------------------------------------*/

/*UI initial setup*/
updatePanel(); //display interface in default position
center_a_ind();
center_d_ind();


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
    updatePanel(); 

    //call gameLoop function to begin reading controller analog stick input
    gameLoop();
});


/* displays alert to the console when controller is disconnected*/
window.addEventListener("gamepaddisconnected", (event) => {

    console.log("Controller disconnected");
    controllerIndex = null; //indicates controller is no longer active
    engine_on_off = false;
    updatePanel();
    //TODO send json object telling python program to stop car ("STOP")
});


/*dynamically updates canvas and contents based on window size*/
function updatePanel(){

    //makes canvas fill entire screen (can create variables to store and update inside gameloop) 
    canvas.width = (window.innerWidth * 0.67);
    canvas.height = window.innerHeight;
    
    //outline acceleration and direction gauges
    outline_a_guage();
    outline_d_guage();

    //fill in acceleration and direction gauges
    draw_guage(a_outline_x, a_outline_y, a_outline_width, a_outline_height);
    draw_guage(d_outline_x, d_outline_y, d_outline_width, d_outline_height);

    display_a_midpoint();
    display_d_midpoint();
    position_on_off_outline();
    position_on_off();
    label_acceleration();
    label_direction();
    draw_throttle();
}

/*labels acceleration gauge*/
function label_acceleration() {

    c.fillStyle = "black"; 
    c.font = (a_outline_width * 0.20).toString() + "px ArcadeClassic";
    c.fillText("Acceleration", a_outline_x - (0.9 * a_outline_x),  (a_outline_x + (a_outline_height/1.85)));
}

/*labels direction gauge*/
function label_direction() {
    c.fillStyle = "black"; 
    c.font = (d_outline_height * 0.20).toString() + "px ArcadeClassic";
    c.fillText("Direction", (d_outline_x + (d_outline_width/3)), (d_outline_y + d_outline_height) * 1.05);
}

/*outlines throttle box*/
function draw_throttle(){

    //outline throttle
    c.fillStyle = "black";
    c.fillRect(d_outline_x + (d_outline_width/4), a_outline_y + (a_outline_height/5), a_outline_height/2, a_outline_height/4);  
    
    //fill in throttle with green for forward, grey for neutral, red for backward
    var relativePosition = fill_in_throttle(d_outline_x + (d_outline_width/4), a_outline_y + (a_outline_height/5), a_outline_height/2, a_outline_height/4);  

    //label throttle
    label_throttle(d_outline_x + (d_outline_width/4), a_outline_y + (a_outline_height/5), a_outline_height/2, relativePosition);
}

/*fills in throttle box*/
function fill_in_throttle(x, y, width, height){

    /*initialize relative position for the arrow*/
    var relativePosition = 0;

    /* Calculate the relative position of the acceleration indicator within 
        the acceleration gauge if gamepad is connected*/
    if(controllerIndex != null){
        const gamepad = navigator.getGamepads()[controllerIndex]; 
        var ypos = gamepad.axes[1];

        if(!(ypos <= 0.004 && ypos >= -0.004)){
            relativePosition = ypos * -100;   
        }       
    }
    
    /*c.fillStyle = relativePosition > 0 ? "green" : relativePosition == 0 ? "grey" : "firebrick";
    c.fillRect(x + height/8, y+ height/8, width-(height/4), height * 0.75);*/  
    return relativePosition.toFixed();
}

function label_throttle(x, y, width, relativePosition) {
     c.fillStyle = "teal";
     c.font = (d_outline_height * 0.20).toString() + "px ArcadeClassic";
     c.fillText("Throttle", ((2 * x) + width / 2.5) / 2, y * 0.975);
 
     c.font = (d_outline_height * 0.20).toString() + "px ArcadeClassic";
 
   

    /*draw arrow to represent if throttle is forward, neutral, or backwards*/
    if(relativePosition > 0){
        c.fillStyle = 'rgb(102, 205, 102)'; //light green
        c.fillText(relativePosition.toString() + "% ↑", ((2 * x) + width / 2.5) / 2, y * 1.20);
    }
    else if(relativePosition == 0) {
        c.fillStyle = "lightgrey";
        c.fillText(relativePosition.toString() + "% ↔", ((2 * x) + width / 2.5) / 2, y * 1.20);
    }
    else {
        c.fillStyle = 'rgb(250, 0, 0)'; //red
        c.fillText(relativePosition.toString() + "% ↓", ((2 * x) + width / 2.5) / 2, y * 1.20); 
    }
}


/*draws gauge within outline (border width is 0.5% of window width)*/
function draw_guage(x, y, width, height){
    c.fillStyle = "darkblue";
    c.fillRect(get_gauge_x(x), get_gauge_y(y), get_gauge_width(width), get_gauge_height(height));  
}

/*retrieves x value to use for gauge with a given x coordinate*/
function get_gauge_x(x){
    return x+(0.005 * window.innerWidth);
}

/*retrieves y value to use for outlining gauge with a given y coordinate*/
function get_gauge_y(y){
    return y+(0.005 * window.innerWidth);
}

/*retrieves width value to use for outlining gauge with a given width*/
function get_gauge_width(width){

    return width- (0.01 * window.innerWidth);
}

/*retrieves height value to use for outlining gauge with a given height*/
function get_gauge_height(height){

    return height- (0.01 * window.innerWidth);
}

/*outlines the engine on_off button*/
function position_on_off() {
      
    //red if engine is on, green if engine is off
    if(!engine_on_off){
        c.strokeStyle = "firebrick";
        c.fillStyle = "firebrick";         
    }

    else{
        c.strokeStyle = "green";
        c.fillStyle = "green";
    }

    //create arc between 0 and 2pi radians (circle) at (on_off_x, on_off_y)
    c.beginPath();
    c.arc(on_off_x,on_off_y, on_off_radius * (18/20), 0, Math.PI * 2, false);
    
    //color in the on-off button
    c.stroke();   
    c.fill();  

    //do some funky stuff to make text go in middle of circle
    c.fillStyle = "white";
    c.font = (on_off_radius*0.30).toString() + "px ArcadeClassic";

     //display engine off if engine is off or engine on if engine on if engine is on
    if(!engine_on_off){
        c.fillText("Engine Off", on_off_x - (on_off_radius)/1.3, on_off_y + (on_off_radius/7));   
    }
    else {
        c.fillText("Engine On", on_off_x - (on_off_radius)/1.375, on_off_y + (on_off_radius/7));   
    } 
}

/*positions the on_off button on screen and sets colors*/
function position_on_off_outline() {

    //position button above and between both guages
    on_off_x = d_outline_x; 
    on_off_radius = window.innerWidth/20;
    on_off_y = a_outline_y - on_off_radius * 1.25;
    
    c.strokeStyle = "silver";

    //create arc between 0 and 2pi radians (circle) at (on_off_x, on_off_y)
    c.beginPath();
    c.arc(on_off_x, on_off_y, on_off_radius, 0, Math.PI * 2, false);

    //draw and fill in the circle
    c.stroke();
    c.fillStyle= "silver";    
    c.fill();  
}

/*outlines acceleration gauge*/
function outline_a_guage() {

    a_outline_x = (window.innerWidth * 0.67)/4; //right two thirds of screen
    //a_guage_y = window.innerHeight/2.25;
    a_outline_y = window.innerWidth * 0.175;

    //1:3 rectangle
    a_outline_width = window.innerWidth * 0.10;
    a_outline_height = window.innerWidth * 0.30;
    ind_width = a_outline_height * 0.015;

    c.fillStyle = "silver";
    c.fillRect(a_outline_x, a_outline_y, a_outline_width, a_outline_height);
}

/*outlines directional gauge*/
function outline_d_guage() {

    //position directional gauge next to acceleration gauge with seperating whitespace
    d_outline_x = a_outline_x + (window.innerWidth * 0.125);

    //position directional gauge perpendicular to acceleration gauge
    d_outline_y = a_outline_y + (window.innerWidth * 0.2);

    //3:1 rectangle
    d_outline_width = window.innerWidth * 0.30;
    d_outline_height = window.innerWidth * 0.10; 

    //TODO set color to white
    c.fillStyle = "silver";
    c.fillRect(d_outline_x, d_outline_y, d_outline_width, d_outline_height);
}


/* Adjusts position acceleration indicator within the acceleration
* after a significant change is detected from the left analog stick.
*/
function position_a_indicator(shift, y){

    //start drawing line
    c.beginPath();

    //get gauge info
    var gauge_width = get_gauge_width(a_outline_width);
    var gauge_height = get_gauge_height(a_outline_height);
    var gauge_x = get_gauge_x(a_outline_x);
    var gauge_y = get_gauge_y(a_outline_y);


    // if no movement -> set the bar at middle
    if((y <= 0.004) && (y >= - 0.004)){
        center_a_ind();
    }

    //move bar based on previous frame
    a_ind_y += (shift * gauge_height); 
    
    //if(y< upperbound) -> keep the bar at the top pos
    if(a_ind_y <= gauge_y) {
        a_ind_y = gauge_y + (ind_width/2);
    }
    //else if(y> lowerbound)-> keep the bar at the bottom pos
    else if(a_ind_y >= gauge_y + gauge_height){
        a_ind_y = gauge_y + gauge_height - (ind_width/2);
    }
   
    c.moveTo(gauge_x, a_ind_y); //where line starts
    c.lineTo(gauge_x + gauge_width, a_ind_y); //where line ends 
    c.strokeStyle = "lightgreen"; //set line color to light green
    c.lineWidth = ind_width; //make lines thick enough to see clearly
    c.stroke(); //fill in line
}

/* Adjusts position acceleration indicator within the acceleration
* after a significant change is detected from the left analog stick.
*/
function position_d_indicator(shift, x){

    var gauge_width = get_gauge_width(d_outline_width);
    var gauge_height = get_gauge_height(d_outline_height);
    var gauge_x = get_gauge_x(d_outline_x);
    var gauge_y = get_gauge_y(d_outline_y);

    c.beginPath();
    
    // if no movement -> set the bar at middle
    if((x <= 0.004) && (x >= - 0.004)){
        center_d_ind();
    }
   
    //move bar based on previous frame
    d_ind_x += (shift * gauge_width); 
    
    
    //if(x > upperbound) -> keep the bar at the right most position
    if(d_ind_x >= gauge_x + gauge_width) {
        d_ind_x = gauge_x + gauge_width + (ind_width/2);
    }
    //else if(x> lowerbound)-> keep the bar at the left-most position
    else if(d_ind_x < gauge_x){
        d_ind_x = gauge_x + (ind_width/2);
    }
   
    c.moveTo(d_ind_x, gauge_y); //where line starts
    c.lineTo(d_ind_x,  gauge_y + gauge_height); //where line ends 
    c.strokeStyle = "lightgreen"; //set line color to light green
    c.lineWidth = ind_width; //make lines thick enough to see clearly
    c.stroke(); //fill in line

}


/*display midpoint of acceleration gauge*/
function display_a_midpoint(){

    c.beginPath();
    a_mid = a_outline_y + (a_outline_height/2) - (ind_width/2);
    c.moveTo(get_gauge_x(a_outline_x), a_mid); //where line starts
    c.lineTo(get_gauge_x(a_outline_x) + get_gauge_width(a_outline_width), a_mid); //where line ends 
    c.strokeStyle = "white"; //set line color to light green
    c.lineWidth = ind_width; //make lines thick enough to see clearly
    c.stroke(); //fill in line
}

/*display midpoint of directional gauge*/
function display_d_midpoint(){

    c.beginPath();
    d_mid = d_outline_x + (d_outline_width/2) - (ind_width/2); 
    c.moveTo(d_mid, get_gauge_y(d_outline_y)); //where line starts (FIXME a_gauge MIDPOINT)
    c.lineTo(d_mid, get_gauge_y(d_outline_y) + get_gauge_height(d_outline_height)); //where line ends (FIXME a_guage MIDPOINT)
    c.strokeStyle = "white"; //set line color to light green
    c.lineWidth = ind_width; //make lines thick enough to see clearly
    c.stroke(); //fill in line
}


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

/*puts acceleration indicator the middle of acceleration gauge*/
function center_a_ind(){
    a_ind_y = a_outline_y + (a_outline_height/2) - (ind_width/2); //initialize acceleration indicator to be in middle of a_guage
}

/*puts directional indicator in the middle of acceleration gauge*/
function center_d_ind(){
    d_ind_x = d_outline_x + (d_outline_width/2) - (ind_width/2);    
} 


/*This is the loop where we will be querying controller for useful information, 
and sending information to other programs.  Used ChatGpt assist with setting up gameloop*/
function gameLoop() {

    //if the controller is connected animation frame is a multiple of 3
    if (controllerIndex != null) {

        //we are assuming only one gamepad is connected to the computer
        const game = navigator.getGamepads()[controllerIndex];

        //update context
        c = canvas.getContext('2d');

        //update gauge positions
        updatePanel();

        //read initial input
        if (first_frame) {
            prev_analog_positions = game.axes;
            first_frame = false;
        }

        //update current axes
        var current_axes = game.axes;

        /* check to see if there were any significant changes in analog sticks since
        previous animation frame */
        var left_right = significantChanges(prev_analog_positions, current_axes);
    
        //if there are significant changes in analog positions, display update to screen
        if (left_right == 1) {

            //package left analog stick data into json object
            const controller_input = JSON.stringify("L:" + current_axes[1]);
            console.log(controller_input);
            //send input to nick
        }

        else if (left_right == 2) {

            //package right analog stick data into json object
            const controller_input = JSON.stringify("R:" + current_axes[2]);
            console.log(controller_input);
            //send input to nick
        }

        else if (left_right == 3) {

            //package analog data into json objects
            const controller_input = JSON.stringify("L:" + current_axes[1] + " | R:" + current_axes[2]);
            console.log(controller_input);
            //send input to nick
       
        }

        left_stick_shift = getPercentDifference(current_axes[1], prev_analog_positions[1]);
        right_stick_shift = getPercentDifference(current_axes[2], prev_analog_positions[2]);        
      
        position_a_indicator(left_stick_shift, current_axes[1]);
        position_d_indicator(right_stick_shift, current_axes[2]); 

        //update prev stick positions
        prev_analog_positions = current_axes;       
    }

    requestAnimationFrame(gameLoop);
}