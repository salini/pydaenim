

$(function() {

	//////////////////////////////////////////////
	// JQUERY FOR ANIMATION CONTROL PANEL
	//////////////////////////////////////////////
	$( "#animation_control" ).show();
	$( "#animation_control_information" ).hide();
	
	
	$( "#animationSlider" ).slider();
	
	
	$( "#speedSelection" )
		.change(function () {
			animationSpeed = $( this ).val();
		});
	

	$( "#slower" ).button({
		text: false,
		icons: { primary: "ui-icon-seek-prev" }
	})
		.click( function () {
			if ($("#speedSelection").get(0).selectedIndex != 0)
			{
				$("#speedSelection").get(0).selectedIndex -= 1;
				$( "#speedSelection" ).change();
			}
		});

	$( "#faster" ).button({
		text: false,
		icons: { primary: "ui-icon-seek-next" }
	})
		.click( function () {
			if ($("#speedSelection").get(0).selectedIndex < animationSpeedOptionLength-1)
			{
				$("#speedSelection").get(0).selectedIndex += 1;
				$( "#speedSelection" ).change();
			}
		});

	$( "#playpause" ).button({
		text: false,
		icons: { primary: "ui-icon-play" }
	})
		.click(function() {
			isPlaying = ! isPlaying;
			if ( isPlaying ) {
				$( this ).button( "option", { label: "pause", icons: { primary: "ui-icon-pause" }} );
			} else {
				$( this ).button( "option", { label: "play", icons: { primary: "ui-icon-play" }} );
			}
		});

	$( "#stop" ).button({
		text: false,
		icons: { primary: "ui-icon-stop" }
	})
		.click(function() {
			isPlaying = false;
			isRecording = false;
			progress = 0;
			currentIndex = 0;
			$("#animationSlider").slider('value', currentIndex);
			$( "#playpause" ).button( "option", { label: "play", icons: { primary: "ui-icon-play" }});
	});

	$( "#record" ).button({
		text: false,
		icons: { primary: "ui-icon-bullet" },
	})
		.click(function () {
			$( "#stop" ).click();
			webDaenimSocket.send( JSON.stringify(['start_recording']) );
			isRecording = true;
			$( "#animation_control_information" ).html("record in folder 'wsdaenim_record'");
			$( "#animation_control_information" ).show("highlight", {}, 750);
			$( "#animation_control_information" ).slideUp(1000);
		});

	$( "#snapshot" ).button({
		text: false,
		icons: { primary: "ui-icon-image" }
	})
		.click( function(){
			image 	= new Image(); 
			image.src = renderer.domElement.toDataURL("image/png;base64");
			
			if (webDaenimSocket != null)
			{
				webDaenimSocket.send( JSON.stringify(['save_img', image.src]) );
				
				$( "#animation_control_information" ).html("save image: 'snaphot.png'");
				$( "#animation_control_information" ).show("highlight", {}, 750);
				$( "#animation_control_information" ).slideUp(1000);
			}
			else
			{
				window.open(image.src);
			}
		});
	
	//when starting, disable all buttons except snapshot
//	$('#animationSlider').slider().slider("disable");
//	$("#speedSelectionBlock").hide();
//	
//	$( "#slower" ).button().button("disable");
//	$( "#faster" ).button().button("disable");
//	$( "#playpause" ).button().button("disable");
//	$( "#stop" ).button().button("disable");
//	$( "#record" ).button().button("disable");
});
