var geometry;
var file;

$(document).ready(function(){

	// Import action
	$('a:contains("Import")').click(function(){
		alert("Import");
	});

	$('input[type=file]').change(function () {
		console.dir(this.files[0])
		file = this.files[0];
		var name = file.name;
		console.log(file);
		console.log(name);

		var reader = new FileReader();
		reader.onload = function(event) {
		    var contents = event.target.result;
		    console.log("File contents: " + contents);
		};

		reader.onerror = function(event) {
		    console.error("File could not be read! Code " + event.target.error.code);
		};
		console.log("file start loading");
		reader.readAsText(file);

		// var loader = new THREE.STLLoader();
		// loader.addEventListener( 'load', function ( event ) {

		// 	geometry = event.content;

		// 	console.log(geometry);

		// 	var material = new THREE.MeshLambertMaterial( { ambient: 0xff5533, color: 0xff5533 } );

		// 	stlObject = new THREE.Mesh( geometry, material );

		// 	scene.add( stlObject );

		// } );
		// loader.load(name);
		
	});
});