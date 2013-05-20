$(document).ready(function() {
	var hideTwitterAttempts = 0;
	function hideTwitterBoxElements() {
   		setTimeout( function() {
        	if ( $('[id*=twitter]').length ) {
        		$('[id*=twitter]').each( function(){
					if ( $(this).width() == 220 ) {
						$(this).width( 198 ); //override min-width of 220px
					}
				var ibody = $(this).contents().find( 'body' );
				ibody.width( $(this).width() + 20 ); //remove scrollbar by adding width

				if ( ibody.find( '.timeline .stream .h-feed li.tweet' ).length ) {
					ibody.find( '.timeline' ).css( 'border', 0 );


					ibody.find( '.timeline .stream' ).css( 'height', 'auto' );
					ibody.find( '.timeline-header').hide();
					ibody.find( '.timeline-footer').hide();
				}
				else {
					$(this).hide();
				}
			});
		}
			hideTwitterAttempts++;
			if ( hideTwitterAttempts < 3 ) {
				hideTwitterBoxElements();
			}
		}, 1500);
	}

	// somewhere in your code after html page load
	hideTwitterBoxElements();
	
	/*
	var moore = "img/moore.png";
	var philips = "img/philips.png";	
	
	$('#l-logo').prepend('<img id="theImg" src="' + moorelogo + '" />')
	$('#r-logo').prepend('<img id="theImg" src="' + moorelogo + '" />')
	*/
	
	var currentLogo = 0;
	var logos = [];
	logos[0] = 'img/moore.png';
	logos[1] = 'img/philips.png';
	
	function changeLogo() {
		currentLogo++;
		if(currentLogo > 1) currentLogo = 0;
	
		$('#l-logo').fadeOut(100,function() {
			$('#l-logo').css({
				'background-image' : "url('" + logos[currentLogo] + "')"
			});
			$('#l-logo').fadeIn(100);
		});
		
		$('#r-logo').fadeOut(100,function() {
			$('#r-logo').css({
				'background-image' : "url('" + logos[currentLogo] + "')"
			});
			$('#r-logo').fadeIn(100);
		});
		setTimeout(changeLogo, 5000);
	}
	
	$(document).ready(function() {
		setTimeout(changeLogo, 2000);        
	});
	
	
});