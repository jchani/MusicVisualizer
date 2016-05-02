var WIDTH = 600;
var HEIGHT = 300;

$(document).ready(function(){
  //global variables declared so that draw function within 'playStream' can access
  var audioCtx;
  var analyser;
  var source;
  var bufferLength;;
  var dataArray;
  var canvas1;
  var canvasCtx1;
  var gradient;
  var canvas2;
  var canvasCtx2;


  SC.initialize({ client_id: "887b335a80f3e625454ebca548c53d96" });
  var audioNode = document.getElementById('audio_player');
  audioNode.crossOrigin = "anonymous"; //prevent CORS access restriction
  var audioSource = new SoundCloudSource(audioNode);
	var loader = new SoundCloudLoader(audioNode, audioSource);


  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var URL = document.getElementById('inputURL').value;
    loader.loadStream(URL);
  });  

});



function SoundCloudSource(audioNode){
	 /**Creates AnalyserNode to extract data **/
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source = audioCtx.createMediaElementSource(audioNode);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  

  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength); //array that holds data (in form of 8 bit unsigned ints)
  
  //set canvas properties
  canvas1 = document.getElementById('canvas1');
  canvasCtx1 = canvas1.getContext("2d");
  canvas1.width = WIDTH;
  canvas1.height = HEIGHT;

  canvas2 = document.getElementById('canvas2');
  canvasCtx2 = canvas2.getContext("2d");
  canvas2.width = WIDTH;
  canvas2.height = HEIGHT;

  //create color gradient for visualizations
  gradient1 = canvasCtx1.createLinearGradient(0, 0, 600, 0);
  gradient1.addColorStop(0, 'rgb(0, 255, 0)');  // Top
  gradient1.addColorStop(1, 'rgb(200, 255, 0)');  

  gradient2 = canvasCtx2.createLinearGradient(0, 0, 600, 0);
  gradient2.addColorStop(0, 'rgb(0, 255, 0)');  // Top
  gradient2.addColorStop(1, 'rgb(200, 255, 0)');  

  

  
  // this.playStream = function(streamUrl){
  //   //sets input stream of the audio element
  // 	audioNode.setAttribute('src', streamUrl);
  //   audioNode.play();
  //   //create audio visualizations
  //   draw(audioCtx, analyser, bufferLength, dataArray, canvasCtx);
  // }
  
};

function playStream(streamUrl, audioNode, audioSource){
  //sets input stream of the audio element
    console.log("playStream's URL is: " + streamUrl);
    audioNode.setAttribute('src', streamUrl);
    audioNode.play();

    //create audio visualizations
    draw(audioNode);
};

//handles requests to SC API and returns JSON object
function SoundCloudLoader(audioNode, audioSource){
	var client_id = "887b335a80f3e625454ebca548c53d96"      
  var sound = {};
  var streamURL = "";
  
  SC.initialize({ client_id: "887b335a80f3e625454ebca548c53d96" });
    
  //Takes the track's URL and loads JSON data object. 
  this.loadStream = function(track_url){

  	SC.get('http://api.soundcloud.com/resolve', {url:track_url}, function(track){
				sound = track;
        streamURL = track.stream_url + '?client_id=' + client_id;
        console.log("The tracks's URL is: " + streamURL);
        //pass streamUrl to audioSource
        playStream(streamURL, audioNode, audioSource);
    }); 
  };
};
  //write directStream later


function draw(){
	canvasCtx1.clearRect(0, 0, 400, 400);
  canvasCtx2.clearRect(0, 0, 400, 400);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx1.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx1.fillRect(0, 0, WIDTH, HEIGHT);
  canvasCtx2.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx2.fillRect(0, 0, WIDTH, HEIGHT);      
      
  /**Most frequenceies will show as empty bars because of low frequency,  **/
  var barWidth = (WIDTH / bufferLength) * 1.1;
  var barHeight;
  
  // a full circle
  var twoPi = 2*Math.PI;
  // align objects along circular path with even distance
  var angleChange = twoPi/bufferLength*1.5; 
  var radius = 100;       
  var centerX = 300;
  var centerY = 150;
  var circleX = 0;
  var circleY = 0;
  var rectX = 0;
  var rotation = 0;
  var smileRotate = 75.0*twoPi/360.0;
  var smileChange = twoPi/(bufferLength*(360/30.0));
  var barWidthCircle = (twoPi*radius)/bufferLength;

  var i = 0;
  for(i; i < bufferLength; i++) {
    barHeight = dataArray[i];
	  //canvas1 rectangles
    canvasCtx1.fillStyle = gradient1; //'rgb(0,255, 0)';
    canvasCtx1.fillRect(rectX,HEIGHT-barHeight/1.5 ,barWidth,barHeight);

    //x and y positions 
    circleX = radius*Math.cos(rotation) + centerX;
    circleY = radius*Math.sin(rotation) + centerY;

    //x and y positions for smile
    smileX = radius*Math.cos(smileRotate) + centerX;
    smileY = radius*Math.sin(smileRotate) + centerY - 65;

    //canvas2 visualizations
    canvasCtx2.fillStyle = gradient2;
    canvasCtx2.fillRect(centerX-15-20,centerY+10,20,5);
    canvasCtx2.fillRect(centerX+15,centerY+10,20,5);      
    canvasCtx2.fillRect(smileX,smileY,5,5);
    //canvasCtx2.rotate(rotation*Math.PI/180);
    canvasCtx2.fillRect(circleX,circleY, barWidthCircle,barHeight/2);

    rectX += barWidth + 1;
    rotation += angleChange;
    smileRotate += smileChange;
  }

    console.log(dataArray);
    //loop with requestAnimationFrame() so that the displayed data keeps updating, and clearing the display with each animation frame
    drawVisual = requestAnimationFrame(draw);
};

