

$(function() {
	//////////////////////////////////////////////
	// JQUERY FOR THREE INFORMATION ACCORDION
	//////////////////////////////////////////////
	$( "#accordion_three_info" ).show();
	$( "#accordion_three_info" ).accordion({
		collapsible: true,
		heightStyle: "content"
	});

	$( "#connectionIndicator" ).button({
		icons: { primary: "ui-icon-transferthick-e-w" }
	});
});
