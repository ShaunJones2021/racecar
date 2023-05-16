/*stores information about canvas html element*/
var canvas = document.querySelector('canvas');

/* stands for context, helps us resize/reposition canvas (super objects)
 * BASIC PREMISE: Making SuperObject! -> taking a lot of methods/functions to implement a dynamic panel to draw shapes (2d) on*/
var c = canvas.getContext('2d');

//makes canvas fill entire screen (can create variables to store and update inside gameloop)
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//takes 4 arguments to fill a rectangle
//(x,y) -> where on screen rectangle will be (quadrant 2)
//(width, height) -> width and height of rectangle


c.fillRect((window.innerWidth/1.75), (window.innerHeight/1.75), 100, 300);

c.fillRect((window.innerWidth/1.45), (window.innerHeight/1.2), 300, 100);


function gameLoop() {



    requestAnimationFrame();
}

