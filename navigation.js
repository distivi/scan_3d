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

		

		var loader = new THREE.STLLoader();
		loader.addEventListener( 'load', function ( event ) {
			showHideWaiting(false);
			geometry = event.content;

			console.log(geometry);

			var material = new THREE.MeshLambertMaterial( { ambient: 0xff5533, color: 0xff5533 } );

			stlObject = new THREE.Mesh( geometry, material );

			scene.add( stlObject );

		} );
		showHideWaiting(true);
		loader.loadFromFile(name);
		
	});
});


function showHideWaiting(isShow) {
	var spinner = $("#waiting-spinner");
	if (isShow) {
		spinner.show();
	} else {
		spinner.hide();
	}
	
}