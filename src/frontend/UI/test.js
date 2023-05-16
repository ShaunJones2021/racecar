test_panel('updatePanel', () => {
    // set up a fake canvas element to test with
    const canvas = {
      width: 0,
      height: 0,
    };
    
    beforeEach(() => {
      // reset canvas dimensions before each test
      canvas.width = 0;
      canvas.height = 0;
    });
  
    it("should update canvas width and height based on window size", () => {
      // set up fake window inner dimensions
      window.innerWidth = 800;
      window.innerHeight = 600;
  
      // call the updatePanel function
      updatePanel();
  
      // assert that the canvas width and height are updated correctly
      expect(canvas.width).toEqual(800);
      expect(canvas.height).toEqual(600);
    });
  
    it("should correctly position the on_off button on the screen", () => {
      // set up fake window inner dimensions
      window.innerWidth = 800;
      window.innerHeight = 600;
  
      // call the updatePanel function
      updatePanel();
  
      // assert that the on_off button is positioned correctly
      expect(on_off_x).toEqual(400);
      expect(on_off_y).toEqual(150);
      expect(on_off_radius).toEqual(50);
    });
  });


  
//Test to verify that the acceleration indicator is centered correctly
test_center_a_ind('center_a_ind', () => {
  //Set up mock values for the acceleration guage
  a_guage_x = 50;
  a_guage_y = 100;
  a_guage_height = 200;
  a_guage_width = 20;

  //Call the function to center the acceleration indicator
  center_a_ind();

  //Check that the y-coordinate of the acceleration indicator is set to the midpoint of the acceleration guage
  expect(a_ind_y).toBe(a_guage_y + (a_guage_height / 2));
});