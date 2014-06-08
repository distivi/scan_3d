var container, camera, scene, renderer, stlObject, scanObject, realScanObject, helper, scanLayers;



$(document).ready(function() {
	var MIN_SCAN = -10;
	var MAX_SCAN = 300;
	var CAMERA_DISTANCE = 100;
	var direction = 1;
	var scanning = false;
	var currentY = 0;


	init();
	animate();

	function debugaxis(axisLength){
		//Shorten the vertex function
		function v(x,y,z){ 
				return new THREE.Vertex(new THREE.Vector3(x,y,z)); 
		}
		
		//Create axis (point1, point2, colour)
		function createAxis(p1, p2, color){
				var line, lineGeometry = new THREE.Geometry(),
				lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
				lineGeometry.vertices.push(p1, p2);
				line = new THREE.Line(lineGeometry, lineMat);
				scene.add(line);
		}
		
		createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
		createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
		createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
	};

	function createPlane(sizeWidth) {
		// plane
		var material = new THREE.MeshLambertMaterial( { ambient: 0xff5533, color: 0x90c9d1 } );
		scanObject = new THREE.Mesh(new THREE.PlaneGeometry(sizeWidth, sizeWidth), material);
		// scanObject.overdraw = true;
		scanObject.frustumCulled = false;
		scanObject.rotation.x = Math.PI / -2;
		scanObject.position.y = MIN_SCAN;
		scene.add(scanObject);

		// scanObject.rotateX(Math.PI / 2);
	}

	function createRealScanObject(radius) {
		var geom = new THREE.Geometry();

		for (var i = 0; i < 3; i++) {
			var angle = Math.PI * 2 * (i / 3.0);
			var x = radius * Math.cos(angle);
			var z = radius * Math.sin(angle);
			var v = new THREE.Vector3(x,0,z);
			geom.vertices.push(v);
		};

		geom.faces.push( new THREE.Face3( 0, 2, 1 ) );
		geom.computeFaceNormals();

		var material = new THREE.MeshLambertMaterial( { ambient: 0xff5533, color:0x90c9d1 } );
		realScanObject = new THREE.Mesh( geom, material );
		// realScanObject.scale = realScanObject.scale.multiplyScalar(50);
		console.log(realScanObject);
		scene.add(realScanObject);
	}

	function init() {

		// container = document.createElement( 'div' );
		// document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 100000 );
		camera.position.set( -100,20,800 );
		camera.lookAt(new THREE.Vector3(0,0,0));

		scene = new THREE.Scene();
		// axis

		debugaxis(500);

		scene.add( new THREE.AmbientLight( 0x222222 ) );

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position = camera.position;
		scene.add( directionalLight );

		scene.add( new THREE.AmbientLight( 0x222222 ) );

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.domElement.id = "canvas-container";
		var drawContainer = $("#draw-container");

		renderer.setSize( parseInt(drawContainer.css("width")), parseInt(drawContainer.css("height")) );

		// container.appendChild( renderer.domElement );
		$("#draw-container").append(renderer.domElement);

		window.addEventListener( 'resize', onWindowResize, false );


	}

	

	function addLight( x, y, z, color, intensity ) {

		var directionalLight = new THREE.DirectionalLight( color, intensity );
		directionalLight.position.set( x, y, z )
		scene.add( directionalLight );

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;

		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function animate() {

		requestAnimationFrame( animate );

		render();

	}

	

	function moveScan(step) {
		// realScanObject.position.setY(currentY);

		// scanObject.position = new THREE.Vector3(0,y,0);
	}

	function render() {

		var timer = Date.now() * 0.0005;

		var center = (stlObject) ? stlObject.geometry.boundingSphere.center : new THREE.Vector3(0,0,0);

		camera.position.x = center.x + Math.cos( timer ) * CAMERA_DISTANCE;
		camera.position.y = center.y + CAMERA_DISTANCE * 0.3;
		camera.position.z = center.z + Math.sin( timer ) * CAMERA_DISTANCE;

		camera.lookAt(center);

		renderer.render( scene, camera );
	}

	// navigation
	$("button[button-inc-dec]").click(function(e) {
		var input = $(e.target).parents(".input-group").children("input").first();
		var newVal = parseInt(input.val());
		var incDec = 5;
		if ($(e.target).attr("button-inc-dec") == "inc") {
			newVal += 5;
		} else {
			newVal -= 5;
			incDec = -5;
		};
		input.val(newVal);
		valueChangedForInput(input,incDec);
		updatePosition();
	});

	function valueChangedForInput(jInput,value) {
		console.log(jInput.val());
		console.log(stlObject);
		console.log(stlObject.rotate);
		console.log(stlObject.rotation);
		console.log(stlObject.position);
		if (jInput.attr("rotate")) {
			var axis;
			var oldVal;
			if (jInput.attr("rotate") == "x") {
				stlObject.rotateX( value * Math.PI / 180);
			} else if (jInput.attr("rotate") == "y") {
				stlObject.rotateY( value * Math.PI / 180);
			} else if (jInput.attr("rotate") == "z") {
				stlObject.rotateZ( value * Math.PI / 180);
			}
		} else if (jInput.attr("position")) {
			// stlObject.positionX(value);
			updatePosition();
		}
	}

	function updatePosition() {
		var x = parseInt($("input[position=x]").val());
		var y = parseInt($("input[position=y]").val());
		var z = parseInt($("input[position=z]").val());
		stlObject.position = new THREE.Vector3(x,y,z);

	}

	// Rotate an object around an arbitrary axis in object space
	var rotObjectMatrix;
	function rotateAroundObjectAxis(object, axis, radians) {
		rotObjectMatrix = new THREE.Matrix4();
		rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

		// old code for Three.JS pre r54:
		// object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
		// new code for Three.JS r55+:
		object.matrix.multiply(rotObjectMatrix);

		// old code for Three.js pre r49:
		// object.rotation.getRotationFromMatrix(object.matrix, object.scale);
		// new code for Three.js r50+:
		object.rotation.setEulerFromRotationMatrix(object.matrix);
	}

	var rotWorldMatrix;
	// Rotate an object around an arbitrary axis in world space       
	function rotateAroundWorldAxis(object, axis, radians) {
		rotWorldMatrix = new THREE.Matrix4();
		rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

		// old code for Three.JS pre r54:
		//  rotWorldMatrix.multiply(object.matrix);
		// new code for Three.JS r55+:
		rotWorldMatrix.multiply(object.matrix);                // pre-multiply

		object.matrix = rotWorldMatrix;

		// old code for Three.js pre r49:
		// object.rotation.getRotationFromMatrix(object.matrix, object.scale);
		// old code for Three.js pre r59:
		// object.rotation.setEulerFromRotationMatrix(object.matrix);
		// code for r59+:
		object.rotation.setFromRotationMatrix(object.matrix);
	}

	function importModelFromFile (file) {
		var loader = new THREE.STLLoader();
		loader.addEventListener( 'load', function ( event ) {
			showHideWaiting(false);
			console.log(event);
			var geometry = event.content;


			// console.log(geometry);

			var material = new THREE.MeshLambertMaterial( { ambient: 0xff5533, color: 0xff5533 } );
			// var material = new THREE.MeshBasicMaterial( { color: 0xff5533 } );

			stlObject = new THREE.Mesh( geometry, material );
			var scale = 1;
			stlObject.scale = stlObject.scale.multiplyScalar(scale);

			helper = new THREE.BoundingBoxHelper(stlObject, 0xff0000);
			helper.update();
			// If you want a visible bounding box
			scene.add(helper);
			// If you just want the numbers
			console.log(helper.box.min);
			// console.log(helper.box.max);

			scene.add( stlObject );

			var boxMin = helper.box.min;
			var boxMax = helper.box.max;

			MIN_SCAN = boxMin.y;
			MAX_SCAN = boxMax.y;

			var size = Math.abs(Math.min(boxMin.z,boxMin.x)) + Math.abs(Math.max(boxMax.x,boxMax.z));
			size *= 1.1;

			// createPlane(size);

			var radius = stlObject.geometry.boundingSphere.radius;
			createRealScanObject(radius * 6);
			realScanObject.scale = realScanObject.scale.multiplyScalar(scale);
			realScanObject.position.y = MIN_SCAN;

			CAMERA_DISTANCE = radius * 3;

		} );
		showHideWaiting(true);
		loader.loadFromFile(file);

	}

	//------------------ Buttons actions  --------------------
	// Import action
	$('a:contains("Import")').click(function(){
		alert("Import");
	});

	$('input[type=file]').change(function () {
		console.dir(this.files[0])
		var file = this.files[0];
		var name = file.name;
		console.log(file);
		importModelFromFile(file);
	});

	$("#scan-button").click(function() {
		scanning = !scanning;
		$(this).html(scanning ? 'Stop scanning' : 'Start scanning');


		var minY = stlObject.geometry.boundingBox.min.y;
		var maxY = stlObject.geometry.boundingBox.max.y;

		var stepsCount = 1000;
		var step = (maxY - minY) / stepsCount;

		currentY = minY;// + (maxY - minY) / 2;
		scanLayers = [];

		while (currentY <= maxY) {
			// console.log("new Y = " + currentY);
			realScanObject.position.setY(currentY);
			// console.log(realScanObject.position.y);
			var lineGeometry = intersectionWith3DObjectAndPlane(stlObject,realScanObject);
			// console.log(lineGeometry.vertices);

			var lineMat = new THREE.LineBasicMaterial({color: 0x00efcc, lineWidth: 1});
			var line = new THREE.Line(lineGeometry, lineMat);
			line.type = THREE.Lines;
			scanLayers.push(line);
			scene.add(line);

			currentY += step;
		}

		$("#layers-slider").slider({max: scanLayers.length - 1});

		scene.remove(realScanObject);
		scene.remove(stlObject);

	});

	function showHideWaiting(isShow) {
		var spinner = $("#waiting-spinner");
		if (isShow) {
			spinner.show();
		} else {
			spinner.hide();
		}
	}

	// var slider = $("#layers-slider").slider();
	$("#layers-slider").on('slide', function(slideEvt) {
		// $("#ex6SliderVal").text(slideEvt.value);
		var value = slideEvt.value;
		var showOneLayer = $("#show-one-layer").prop("checked");

		for (var i = 0; i < scanLayers.length; i++) {
			if ((showOneLayer && i == value) || (!showOneLayer && i <= value)) {
				scanLayers[i].visible = true;
			} else {
				scanLayers[i].visible = false;
			}
		}
	});
});



