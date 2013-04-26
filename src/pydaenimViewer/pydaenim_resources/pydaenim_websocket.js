

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// WEBSOCKET
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

if ( webDaenimSocket != null)
{
	$( "#connectionIndicator" ).button().button("enable");
	$( "#connectionIndicator" ).button('option', 'label', "connected to: "+webDaenimSocket.url);
	
	webDaenimSocket.onopen = function() {
		div_info.innerHTML += "connection opened <br>";
	};
	
	webDaenimSocket.onmessage = function (event) 
	{
		received_msg = event.data; 
		obj = JSON.parse(received_msg);
		if (obj[0] == "update_transforms")
		{
			update_simulation_time(obj[1]);
			update_transform_from_msg(obj[2]);
		}
//		else if  (obj[0] == "set_movable_frames")
//		{
//			
//			animationMovableNodeName = obj[1];
//		}
	};
	
	webDaenimSocket.onclose = function()
	{ 
		$( "#connectionIndicator" ).button().button("disable");
		$( "#connectionIndicator" ).button('option', 'label', "not connected");
		$( "#connectionIndicator" ).effect("highlight", {color: 'red'}, 1000);
		webDaenimSocket = null;
		if ($( "#record" ).is(":enabled"))
		{
			$( "#record" ).button().button("disable");
			$( "#record" ).effect("highlight", {color: 'red'}, 1000);
		}
	};
}
else
{
	$( "#connectionIndicator" ).button().button("disable");
	$( "#connectionIndicator" ).button('option', 'label', "not connected");
}

