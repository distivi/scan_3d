$(document).ready(function() {
	var container, camera, scene, renderer, stlObject, scanObject;

	var MIN_SCAN = -10;
    var MAX_SCAN = 300;
    var direction = 1;
    var scanning = false;

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

    function createPlane(scene) {
		// plane
		var material = new THREE.MeshLambertMaterial( { ambient: 0xff5533, color: 0x90c9d1 } );
		scanObject = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), material);
		// scanObject.overdraw = true;
		scanObject.frustumCulled = false;
		scanObject.rotation.x = Math.PI / -2;
		scanObject.position.y = MIN_SCAN;
		scene.add(scanObject);


		// scanObject.rotateX(Math.PI / 2);
    }

    function init() {

        // container = document.createElement( 'div' );
        // document.body.appendChild( container );

        $("#canvas-container")

        camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.set( -100,500,800 );
        camera.lookAt(new THREE.Vector3(0,0,0));

        scene = new THREE.Scene();

        // object

        var loader = new THREE.STLLoader();
        loader.addEventListener( 'load', function ( event ) {

            var geometry = event.content;

            var material = new THREE.MeshLambertMaterial( { ambient: 0xff5533, color: 0xff5533 } );

            stlObject = new THREE.Mesh( geometry, material );

            scene.add( stlObject );

        } );
        loader.load( './models/stl/Budda.STL' );

        // axis

        debugaxis(500);

        // scan plane 
        createPlane(scene);

        // lights

        scene.add( new THREE.AmbientLight( 0x222222 ) );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position = camera.position;
        scene.add( directionalLight );

        scene.add( new THREE.AmbientLight( 0x222222 ) );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );

        // container.appendChild( renderer.domElement );
        $("#canvas-container").append(renderer.domElement);

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
    	var y = scanObject.position.y + direction;

    	if (scanObject.position.y >= MAX_SCAN) {
    		direction = -1;
    	};

    	if (scanObject.position.y <= MIN_SCAN) {
    		direction = 1;
    	};

    	scanObject.position = new THREE.Vector3(0,y,0);
    }

    function render() {

        var timer = Date.now() * 0.0005;

        // camera.position.x = Math.cos( timer ) * 500;
        // camera.position.z = Math.sin( timer ) * 500;
        // scanObject.rotation.x = timer;

        // camera.lookAt( scene.position );
        if (scanning) {
        	moveScan(timer);
        };
        

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

    $("#scan-button").click(function() {
    	scanning = !scanning;
    	$(this).html(scanning ? 'Stop scanning' : 'Start scanning');
    });

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
    
});