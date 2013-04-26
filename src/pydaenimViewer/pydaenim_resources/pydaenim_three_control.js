
function onWindowResize() {
	container = document.getElementById( "three_inside" );
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( container.clientWidth, container.clientHeight );
}


$(function() {

	//////////////////////////////////////////////
	// JQUERY FOR THREE CONTROL ACCORDION
	//////////////////////////////////////////////
	$( "#accordion_three_control" ).show();
	$( "#accordion_three_control" ).accordion({
		collapsible: true,
		heightStyle: "content"
	});

	$( "#btn_display_options" ).button()
		.click( function () {
			$( "#dialog_display_options" ).dialog( "open" );
		});

	$( "#dialog_display_options" ).dialog({
		autoOpen: false,
		width: 400,
		modal: true,
		buttons: {
			"set options": function() {
				var bValid = true;
			
				if ( bValid ) {
					$("#three_player").width(parseInt($("#in_window_width").val()));
					$("#three_player").height(parseInt($("#in_window_height").val()));
					onWindowResize();
					
					grid_scale = parseFloat($("#in_grid_scale").val());
					grid.scale.set(grid_scale, grid_scale, grid_scale);
					
					if (frame_arrows_scale != parseFloat($("#in_frame_scale").val()))
					{
						if (list_of_frame_arrows == null)
						{
							list_of_frame_arrows = [];
							parse_model_to_create_frames(model);
						}
						frame_arrows_scale = parseFloat($("#in_frame_scale").val());
						for (i=0; i<list_of_frame_arrows.length; i++)
						{
							list_of_frame_arrows[i].scale.set( frame_arrows_scale, frame_arrows_scale, frame_arrows_scale );
						}
					}
					
					if (text_mesh_scale != parseFloat($("#in_text_scale").val()))
					{
						if (list_of_texts == null)
						{
							list_of_texts = [];
							parse_model_to_create_names(model);
						}
						text_mesh_scale = parseFloat($("#in_text_scale").val());
						for (i=0; i<list_of_texts.length; i++)
						{
							list_of_texts[i].scale.set( text_mesh_scale, text_mesh_scale, text_mesh_scale );
						}
					}
					
					if (inertia_scale_factor != parseFloat($("#in_inertia_scale").val()))
					{
						if (list_of_inertias == null)
						{
							init_physics_model_data();
						}
						inertia_scale_factor = parseFloat($("#in_inertia_scale").val());
						for (i=0; i<list_of_inertias.length; i++)
						{
							list_of_inertias[i].scale.set( inertia_scale_factor, inertia_scale_factor, inertia_scale_factor );
						}
					}
					
					$( this ).dialog( "close" );
				}
			},
			
			Cancel: function() {
				$( this ).dialog( "close" );
				}
			},
		open: function(event, ui) {
			$("#in_window_width").val( $("#three_player").width() );
			$("#in_window_height").val( $("#three_player").height() );
			
			$("#in_grid_scale").val(grid_scale);
			$("#in_frame_scale").val(frame_arrows_scale);
			$("#in_text_scale").val(text_mesh_scale);
			$("#in_inertia_scale").val(inertia_scale_factor);
			
			$(":button:contains('set options')").focus();
			$( this ).keypress(function(e) {
				if( e.keyCode == 13 ) { //13 for RETURN key
					$(":button:contains('set options')").click();
				}
			});
		},
		close: function() {
		}
	});


	$( "#btn_camera" ).button()
		.click( function() {
			$( "#dialog_camera" ).dialog( "open" );
		});

	$( "#dialog_camera" ).dialog({
		autoOpen: false,
		//height: 300,
		width: 500,
		modal: true,
		buttons: {
			"set camera": function() {
				var bValid = true;
			
				if ( bValid ) {
					camera.position.set( parseFloat($("#cam_pos_x").val()), parseFloat($("#cam_pos_y").val()), parseFloat($("#cam_pos_z").val()) );
					camera.up.set( parseFloat($("#cam_up_x").val()), parseFloat($("#cam_up_y").val()), parseFloat($("#cam_up_z").val()) );
					
					if ( $("#cam_coi_x").val() && $("#cam_coi_y").val() && $("#cam_coi_z").val() )
					{
						controls.target.set( parseFloat($("#cam_coi_x").val()), parseFloat($("#cam_coi_y").val()), parseFloat($("#cam_coi_z").val()) );
					}
					camera.fov  = parseFloat($("#cam_fov").val());
					camera.near = parseFloat($("#cam_near").val());
					camera.far  = parseFloat($("#cam_far").val());
					camera.updateProjectionMatrix();

					$( this ).dialog( "close" );
				}
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		open: function(event, ui) {
			$("#cam_pos_x").val(camera.position.x.toPrecision(6));
			$("#cam_pos_y").val(camera.position.y.toPrecision(6));
			$("#cam_pos_z").val(camera.position.z.toPrecision(6));
			$("#cam_up_x").val(camera.up.x.toPrecision(6));
			$("#cam_up_y").val(camera.up.y.toPrecision(6));
			$("#cam_up_z").val(camera.up.z.toPrecision(6));
			$("#cam_coi_x").val(controls.target.x.toPrecision(6));
			$("#cam_coi_y").val(controls.target.y.toPrecision(6));
			$("#cam_coi_z").val(controls.target.z.toPrecision(6));
			$("#cam_fov").val(camera.fov);
			$("#cam_near").val(camera.near);
			$("#cam_far").val(camera.far);
			$(":button:contains('set camera')").focus();
			$( this ).keypress(function(e) {
				if( e.keyCode == 13 ) { //13 for RETURN key
					$(":button:contains('set camera')").click();
				}
			});
		},
		close: function() {}
	});


	$( "#check_bgcolor" ).button()
		.click( function () {
			if ($(this).is(":checked"))
			{
			  $( "#bgcolor_colorpicker" ).colorpicker().colorpicker("enable");
			  color	= $('#bgcolor_colorpicker').colorpicker().val();
			  currentBGColor = parseInt(color.substr(1), 16);
			  currentBGOpacity = 1;
			  
			  renderer.setClearColorHex( currentBGColor, currentBGOpacity );
			}
			else
			{
				$( "#bgcolor_colorpicker" ).colorpicker().colorpicker("disable");
				currentBGColor   = 0;
				currentBGOpacity = 0;
				renderer.setClearColorHex( currentBGColor, currentBGOpacity );
			};
		});

	$( '#bgcolor_colorpicker' ).colorpicker({color:'#dbe5f1'})
		.on('change.color', function(evt, color){
			currentBGColor = parseInt(color.substr(1), 16);
			renderer.setClearColorHex( currentBGColor, currentBGOpacity );
		});
	$( "#bgcolor_colorpicker" ).colorpicker().colorpicker("disable");



	$( "#collada_display_set" ).buttonset();
	
	$( "#check_grid" ).button()
		.click( function () {
			if ($(this).is(":checked"))
			{
				grid.traverse( function ( object ) { object.visible = true; } );
			}
			else
			{
				grid.traverse( function ( object ) { object.visible = false; } );
			};
		});

	$( "#check_shapes" ).button()
		.click(function(){
			value = $(this).is(":checked");
			for (i=0; i<list_of_shapes.length; i++)
			{
				list_of_shapes[i].visible = value;
			}
		});

	$( "#check_frame" ).button()
		.click(function(){
			if (list_of_frame_arrows == null)
			{
				list_of_frame_arrows = [];
				parse_model_to_create_frames(model);
			}
			
			value = $(this).is(":checked");
			for (i=0; i<list_of_frame_arrows.length; i++)
			{
				list_of_frame_arrows[i].visible = value;
			}
		});

	$( "#check_name" ).button()
		.click(function(){
			if (list_of_texts == null)
			{
				list_of_texts = [];
				parse_model_to_create_names(model);
			}
			
			value = $(this).is(":checked");
			for (i=0; i<list_of_texts.length; i++)
			{
				list_of_texts[i].visible = value;
			}
		});

	$( "#check_inertia" ).button()
		.click(function () {
			if ( list_of_inertias == null)
			{
				init_physics_model_data();
			}
			
			value = $(this).is(":checked");
			for (i=0; i<list_of_inertias.length; i++)
			{
				list_of_inertias[i].visible = value;
			}
		});

});
