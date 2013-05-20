//Function to get more than one tag out of the instagetter
//When calling the function the params should be in a string like - instaGetter('firsttag, secondtag, thirdtag');
//The function will split on the commas and create a feed for each tag

//NOW ONLY OPTIMIZED FOR 1 TAG

function instaGetter(params){
	$("#choosenHash").html('#' + params);
	array_of_tags = params.split(', ');
	var name_of_tag;
	var currentOBJ = '';
	var doFeed = true;	

	for (var i = 0; i < array_of_tags.length; i++){
		//The tagname to use
		if(currentOBJ == ''){
			name_of_tag = array_of_tags[i];
			$('#instafeed').append('<div id="'+name_of_tag+'"></div>');
		}
		
		var feed = new Instafeed({	
			target: name_of_tag,
			get: 'tagged',
			tagName: name_of_tag,
			clientId: 'bf5093520bb54d3cac22e936e98a3804',
			limit: 60,
			template: '<div class="instaPost"><div class="instaPicture"><a href="{{link}}"><img src="{{image}}" alt="instaimg"></a></div><p class="instaUser"><a href="{{link}}">{{model.user.username}}</a></p></div>',
			success: function(data){
			
				
				///////
				if (currentOBJ == ''){
					doFeed = true;
					currentOBJ = data;
					console.log('it changed');
				}else{
					if(data.data[0].id == currentOBJ.data[0].id){
						//Do nothing
						console.log('exactly the same');
						doFeed = false;
						return;

					}else{
						doFeed = true;
						currentOBJ = data;
						console.log('it changed');
					}
				}
				/////////
			}
		});

	feed.run();
	setInterval(function(){
		//Run the feed
		if(doFeed){
			feed.mock = true;
			feed.run();
			console.log('should be imgs')
		}else{
			feed.mock = false;
			feed.run();
			console.log('should not put imgs');
		}			
		
	},10000)

	}	
}

//This is the caller of the function!! put in the tag u want to use!!
instaGetter('lovemoore');

