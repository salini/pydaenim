
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// JQUERY UI HEADERS
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

$(function() {

	//////////////////////////////////////////////
	// JQUERY MISC CONTROLS
	//////////////////////////////////////////////

	// Hover states on the static widgets
	$( "#dialog-link, #icons li" ).hover(
		function() {
			$( this ).addClass( "ui-state-hover" );
		},
		function() {
			$( this ).removeClass( "ui-state-hover" );
		}
	);

});




/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// JQUERY UI EVENTS FUNCTIONS FOR ANIMATION CONTROL
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

function player_slider_start(event,ui) {
	isPlaying = false;
	$( "#playpause" ).button( "option", {
		label: "play",
		icons: {primary: "ui-icon-play"}
		});
}

function player_slider_change (event, ui) {
	var idx = $('#animationSlider').slider("value");
	progress = timeline[idx];
	animation_goto_keyframe(idx);
	animationTimeInfo.innerHTML = progress +'s ('+ idx +')';
}


function saveRecordSnapShot() {
	image 	= new Image();
	image.src = renderer.domElement.toDataURL("image/png;base64");
	webDaenimSocket.send( JSON.stringify(['rec_img', currentIndex, image.src]) );
}


function set_animation_control_state (isAnimated) {
	
	if (isAnimated)
	{
		//TO DEFINE SLIDER AND EVENTS
		$("#animationSlider").slider().slider("enable");
		$("#animationSlider").slider('option',{min: 0, max: timeline.length});
		$('#animationSlider').slider().bind({
			slidestart  : player_slider_start,
			slidechange : player_slider_change
		});
		//TO TRIGGER EVENTS
		animationSpeedOptionLength = $("#speedSelection option").length;
		
		$('#animationSlider').slider().slider("enable");
		$("#speedSelectionBlock").show();
		$( "#slower" ).button().button("enable");
		$( "#faster" ).button().button("enable");
		$( "#playpause" ).button().button("enable");
		$( "#stop" ).button().button("enable");
		$( "#record" ).button().button("enable");
		$( "#snapshot" ).button().button("enable");
	}
	else
	{
		
		$('#animationSlider').slider().slider("disable");
		$("#speedSelectionBlock").hide();
		$( "#slower" ).button().button("disable");
		$( "#faster" ).button().button("disable");
		$( "#playpause" ).button().button("disable");
		$( "#stop" ).button().button("disable");
		$( "#record" ).button().button("disable");
		$( "#snapshot" ).button().button("enable");
		
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTION FOR MODEL & RENDERING
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

function set_camera_up_from_collada (collada) {
	if (camera_up_vector.length != 3)
	{
		mlookAt = new THREE.Matrix4();
		if (collada.colladaUp == 'X')
		{
			camera.up.set(1,0,0);
			mlookAt.lookAt(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(1,0,0)  );
		}
		else if (collada.colladaUp == 'Y')
		{
			camera.up.set(0,1,0);
			mlookAt.lookAt(new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0)  );
		}
		else if (collada.colladaUp == 'Z')
		{
			camera.up.set(0,0,1);
			mlookAt.lookAt(new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,1)  );
		}
		grid.applyMatrix(mlookAt);
	}
}


function parse_model_recursively(_node, info_coll, tray)
{
	_node.matrixAutoUpdate = false;
	_node.matrixWorldNeedsUpdate = true;
	
	if (_node.name)
	{
		info_coll.innerHTML += tray + _node.name + "<br>";
		allModelNodes[_node.name] = _node;
	}
	if (_node instanceof THREE.Mesh)
	{
		list_of_shapes.push(_node);
	}
	for (var i=0; i< _node.children.length; i++)
	{
		parse_model_recursively(_node.children[i], info_coll, tray + "-");
	}
}


function parse_model_to_create_names(_node)
{
	if (_node.name)
	{
		tm = create_text_mesh(_node.name);
		tm.scale.set( text_mesh_scale, text_mesh_scale, text_mesh_scale );
		tm.visible = false;
		list_of_texts.push(tm);
		_node.add( tm );
	}
	for (var i=0; i< _node.children.length; i++)
	{
		parse_model_to_create_names(_node.children[i]);
	}
}

function parse_model_to_create_frames(_node)
{
	if (_node.name)
	{
		ar = create_frame_arrows();
		ar.scale.set( frame_arrows_scale, frame_arrows_scale, frame_arrows_scale );
		ar.visible = false;
		list_of_frame_arrows.push(ar);
		_node.add( ar );
	}
	for (var i=0; i< _node.children.length; i++)
	{
		parse_model_to_create_frames(_node.children[i]);
	}
}

function create_frame_arrows()
{
	if (frame_arrows_geometry == null)
	{
		frame_arrows_geometry = new THREE.Geometry();
	
		frame_arrows_geometry.vertices.push(
			new THREE.Vector3(), new THREE.Vector3( 1, 0, 0 ),
			new THREE.Vector3(), new THREE.Vector3( 0, 1, 0 ),
			new THREE.Vector3(), new THREE.Vector3( 0, 0, 1 )
		);
		frame_arrows_geometry.colors.push(
			new THREE.Color( 0xff0000 ), new THREE.Color( 0xff0000 ),
			new THREE.Color( 0x00ff00 ), new THREE.Color( 0x00ff00 ),
			new THREE.Color( 0x0000ff ), new THREE.Color( 0x0000ff )
		);
		frame_arrows_material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
	}
	return new THREE.Line( frame_arrows_geometry, frame_arrows_material, THREE.LinePieces );
}

function create_inertia_mesh () {

	if ( inertia_geometry == null ) {

		inertia_geometry = new THREE.IcosahedronGeometry(1, 2);

	}
	return new THREE.Mesh(inertia_geometry, new THREE.MeshLambertMaterial( { color: 0x777777,  shading: THREE.SmoothShading} ) ); //, shading: THREE.FlatShading
}

function create_text_mesh( _text )
{
	var tgeo = new THREE.TextGeometry( _text, {
					size: 1,
					height: 0,
					font: "helvetiker"
				});
	return new THREE.Mesh(tgeo, new THREE.MeshBasicMaterial({color: 0x000000}) ); 
}

function create_camera()
{
	camera = new THREE.PerspectiveCamera( 40, three_inside.clientWidth / three_inside.clientHeight, 0.01, 1000 );
	camera.position.set( 3, 3, 3 );
	if (camera_up_vector.length == 3)
	{
		camera.up.set(camera_up_vector[0], camera_up_vector[1], camera_up_vector[2]);
	}
}


function create_grid()
{
	var material = new THREE.LineBasicMaterial( { color: 0x000000 } );
	var geometry = new THREE.Geometry();
	var size = 10;
	for ( var i = -size; i <= size; i ++ ) {

		geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
		geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
		geometry.vertices.push( new THREE.Vector3( i, 0, -size ) );
		geometry.vertices.push( new THREE.Vector3( i, 0,  size ) );
	}
	var grid = new THREE.Line( geometry, material, THREE.LinePieces );
	
	grid.scale.set(grid_scale, grid_scale, grid_scale);
	
	if (grid_up_vector.length == 3)
	{
		var mlookAt = new THREE.Matrix4();
		if ( grid_up_vector.distanceTo( new THREE.Vector3(1,0,0) ) > .001  )
		{
			mlookAt.lookAt(new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0), new THREE.Vector3(grid_up_vector[0], grid_up_vector[1], grid_up_vector[2])  );
		}
		else
		{
			mlookAt.lookAt(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(grid_up_vector[0], grid_up_vector[1], grid_up_vector[2])  );
		}
		grid.applyMatrix(mlookAt);
	}
	
	
	return grid;
}

function create_light()
{
	pointLight = new THREE.PointLight( 0xffffff, 1.75 );
	pointLight.position = camera.position;
	pointLight.rotation = camera.rotation;
	pointLight.scale = camera.scale;
	return pointLight;
}


function animation_goto_keyframe( idx )
{
	for ( var i = 0; i < kfAnimationsLength; ++i )
	{
		node = animationMovableNode[i];
		m	= animationNodeData[i][idx];
		
		node.quaternion.setFromRotationMatrix(m);
		node.position = m.getPosition();
		node.updateMatrix();
	}
}





/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTION FOR LOADING COLLADA MODEL & ANIMATION
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////


function read_collada( collada )
{
	three_inside.innerHTML = "loading collada file: "+input_collada_file+" <br>";
	div_info.innerHTML += "create three.js scene <br>";
	model = collada.scene;
	animations = collada.animations;
	physics_models = collada.dae.physics_models;

	init_animation_data(); //load animation data BEFORE model, else some problems occurs
	init_model_data();
	init_three_scene();
	set_camera_up_from_collada (collada);
	
	div_info.innerHTML += "finished; display scene <br>";
	animate( lastTimestamp );
};


function init_model_data()
{
	list_of_shapes = [];
	allModelNodes  = {};
	$( '#check_shapes' ).attr('checked', true);
	info = document.getElementById( "div_collada_info" );
	parse_model_recursively(model, info, "");
}


function init_physics_model_data ()
{

	list_of_inertias = [];

	for (phy_model in physics_models) {

		var rigid_bodies = physics_models[phy_model].rigid_body;

		for (var i = 0; i < rigid_bodies.length; i++ ) {

			parent_node = allModelNodes[rigid_bodies[i].sid];

			if (parent_node) {

				var inertia_supporting_node = new THREE.Object3D();
				inertia_supporting_node.applyMatrix( rigid_bodies[i].mass_frame );
				inertia_supporting_node.scale.set( rigid_bodies[i].inertia.x, rigid_bodies[i].inertia.y, rigid_bodies[i].inertia.z );
				parent_node.add(inertia_supporting_node);
				

				var inertia_node = create_inertia_mesh();
				inertia_node.scale.set( inertia_scale_factor, inertia_scale_factor, inertia_scale_factor);
				inertia_node.visible = false;
				list_of_inertias.push(inertia_node);
				inertia_supporting_node.add(inertia_node);

			}

		}

	}

}

function init_animation_data()
{
	kfAnimationsLength = animations.length;
	if (kfAnimationsLength > 0)
	{
		colladaIsAnimated = true;
	
		// KeyFrame Animations
		var animHandler = THREE.AnimationHandler;
		
		for ( var i = 0; i < kfAnimationsLength; ++i ) {

			var animation = animations[ i ];
			animHandler.add( animation );

			var kfAnimation = new THREE.KeyFrameAnimation( animation.node, animation.name );
			kfAnimation.timeScale = 1;
			kfAnimations.push( kfAnimation );
		}

		for ( var i = 0; i < kfAnimationsLength; ++i ) {

			var animation = kfAnimations[i];

			for ( var h = 0, hl = animation.hierarchy.length; h < hl; h++ ) {

				var keys = animation.data.hierarchy[ h ].keys;
				var sids = animation.data.hierarchy[ h ].sids;
				var obj = animation.hierarchy[ h ];

				if ( keys.length && sids ) {
					obj.matrixAutoUpdate = false;
					obj.matrixWorldNeedsUpdate = true;
					animation.data.hierarchy[ h ].node.updateMatrix();
				}
			}
			animation.play( false, 0 );
			
			//save animation matrices in associative array
			kk = animation.data.hierarchy[0].keys;
			anim_data = [];
			for (idx=0; idx<kk.length; idx++)
			{
				el = kk[idx].targets[0].data.elements;
				m = new THREE.Matrix4(el[0], el[4], el[8], el[12],
									  el[1], el[5], el[9], el[13],
									  el[2], el[6], el[10], el[14],
									  el[3], el[7], el[11], el[15]);
				anim_data.push(m);
			}
			animationMovableNode[i] = animation.root;
			animationNodeData[i] = anim_data;

		}

		//GET TIMELINE:
		timeline = [];
		var anim = kfAnimations[0];
		$( "#connectionIndicator" ).button
		for (var i=0; i< anim.data.hierarchy[0].keys.length; i++)
		{
			timeline.push(anim.data.hierarchy[0].keys[i].time);
		}
	}
	else
	{
		colladaIsAnimated = false;
	}
	
	set_animation_control_state(colladaIsAnimated);
	lastTimestamp = Date.now();
}




function init_three_scene() {

	//Camera
	create_camera();

	// Scene
	scene = new THREE.Scene();

	scene.add( model );

	grid = create_grid() ;
	scene.add( grid );
	$( '#check_grid' ).attr('checked', true);

	light = create_light();
	scene.add( light );

	// Renderer
	if ( Detector.webgl )
	{
		renderer = new THREE.WebGLRenderer( { antialias: true} );  // preserveDrawingBuffer to take screenshot;   //, preserveDrawingBuffer   : true 
	}
	else
	{
		renderer = new THREE.CanvasRenderer( { antialias: true } );
	}
	renderer.setSize( three_inside.clientWidth, three_inside.clientHeight );

	three_inside.innerHTML = "";
	three_inside.appendChild( renderer.domElement );

	// Stats
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.left = '0px';
	three_inside.appendChild( stats.domElement );


	// THANK YOU: http://www.jaanga.com/2012/10/using-threejs-with-datgui-user.html
	controls = new THREE.TrackballControls( camera, renderer.domElement );
//				controls.rotateSpeed = 1.0;
//				controls.zoomSpeed = 2.0;
//				controls.panSpeed = 0.8;
//				controls.noZoom = false;
//				controls.noPan = false;
//				controls.staticMoving = true;
//				controls.dynamicDampingFactor = 0.3;
//				controls.enabled = true;
}


function animate()
{
	var timestamp = Date.now();
	
	if (isPlaying)
	{
		var frameTime = ( timestamp - lastTimestamp ) * 0.001 * animationSpeed; // seconds
		progress += frameTime;
		
		while (progress > timeline[currentIndex])
		{
			currentIndex +=1;
			if (currentIndex >= timeline.length)
			{
				progress = 0;
				currentIndex=0;
				break;
			}
		}
		$("#animationSlider").slider('value', currentIndex); //we modifiy the simulation through the slider
	}
	else if (isRecording)
	{
		saveRecordSnapShot();
		currentIndex +=1;
		
		if (currentIndex == timeline.length)
		{
			$("#stop").click();
			isRecording = false;
			currentIndex=0;
		}
		$("#animationSlider").slider('value', currentIndex); //we modifiy the simulation through the slider

	} 

	controls.update();
	renderer.render( scene, camera );
	stats.update();
	requestAnimationFrame( animate );

	lastTimestamp = timestamp;
}





function update_transform_from_msg (frame_transforms)
{
	for (frame in frame_transforms)
	{
		el = frame_transforms[frame];
		m = new THREE.Matrix4(el[0], el[1], el[2] , el[3],
							  el[4], el[5], el[6] , el[7],
							  el[8], el[9], el[10], el[11],
							  0	, 0	, 0	 , 1);

		node = allModelNodes[frame];
		node.quaternion.setFromRotationMatrix(m);
		node.position = m.getPosition();
		node.updateMatrix();
	}
	
}

function update_simulation_time(new_time)
{
	animationTimeInfo.innerHTML = new_time.toPrecision(6) + "("+currentIndex+")";
	currentIndex +=1;
}




/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// LOAD COLLADA
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

if (input_collada_file != '')
{
	try
	{
		var loader = new THREE.ColladaLoader();
		loader.load( input_collada_file, read_collada);
	}
	catch(err)
	{
		"Error while loading collada file: "+input_collada_file+" <br><br>"+err;
	}
}
else
{
	three_inside.innerHTML = "no collada file selected. <br>";
}














