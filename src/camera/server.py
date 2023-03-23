import cv2
from flask import Flask, render_template, Response

app = Flask(__name__)
#gst_in= 'v4l2src device=/dev/video1 ! video/x-raw,format=(string)YUY2,width=640,height=480,framerate=30/1 ! videorate ! video/x-raw,framerate=30/1 ! nvvidconv ! video/x-raw(memory:NVMM) ! nvvidconv ! video/x-raw,format=BGRx ! videoconvert ! video/x-raw, format=BGR ! queue silent=1 max-size-buffers=30 ! appsink'

#camera = cv2.VideoCapture(0)#cv2.VideoCapture("v4l2src device=/dev/video0 ! video/x-raw, width=640, height=480 ! videoconvert ! appsink", cv2.CAP_GSTREAMER)

#camera = cv2.VideoCapture("v4l2src device=/dev/video0 ! video/x-raw, width=640, height=480 ! videoconvert ! appsink", cv2.CAP_GSTREAMER)
#camera = cv2.VideoCapture(0)
#camera = cv2.VideoCapture("v4l2src device=/dev/video0 ! video/x-raw, format=YUY2 ! videoconvert ! video/x-raw, format=BGR ! appsink drop=1", cv2.CAP_GSTREAMER)
#camera = cv2.VideoCapture("v4l2src device=/dev/video0 ! video/x-raw,format=YUY2,width=640,height=480,framerate=30/1 ! videoconvert ! video/x-raw,format=BGR ! appsink ")
#assert camera.isOpened()
#camera = cv2.VideoCapture(" v4l2src device=/dev/video0 ! image/jpeg, format=MJPG ! jpegdec ! video/x-raw,format=BGR ! appsink drop=1", cv2.CAP_GSTREAMER)
#camera.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc("M", "J", "P", "G"))

#camera = cv2.VideoCapture(gst_in, cv2.CAP_GSTREAMER)
#gst_out='appsrc ! videoconvert ! xvimagesink'
#out = cv2.VideoWriter(gst_out, cv2.CAP_GSTREAMER, 0, 30, (416,416))
#print(out)
#success, frame = camera.read()
#print(success, frame)
def gen_frames():
	camera = cv2.VideoCapture(0)
	camera.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc("M", "J", "P", "G"))
	#camera = cv2.VideoCapture("v4l2src device=/dev/video0 ! video/x-raw, width=640, height=480 ! videoconvert ! appsink")
	#camera.set(3,256)
	#camera.set(4,144)
	#camera =cv2.VideoCapture("v4l2src device=/dev/video0 ! video/x-raw, format=YUY2 ! nvvidconv ! video/x-raw(memory:NVMM) ! nvvidconv ! video/x-raw, format=BGRx ! videoconvert ! video/x-raw, format=BGR ! appsink drop=1", cv2.CAP_GSTREAMER)    camera.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc("M", "J", "P", "G"))
	assert camera.isOpened()
	while True:
		success, frame = camera.read()  # read the camera frame
		if not success:
			break
		else:
			ret, buffer = cv2.imencode('.jpg', frame)
			frame = buffer.tobytes()
			yield (b'--frame\r\n'
			b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result

@app.route('/')
def index():
    return render_template('index.html')
    
@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
