//Function to get more than one tag out of the instagetter
//When calling the function the params should be in a string like - instaGetter('firsttag, secondtag, thirdtag');
//The function will split on the commas and create a feed for each tag
function instaGetter(params){
	array_of_tags = params.split(', ');
	var name_of_tag;

	for (var i = 0; i < array_of_tags.length; i++){
		//The tagname to use
		name_of_tag = array_of_tags[i];
		$('#instafeed').append('<div id="'+name_of_tag+'"></div><hr>');

		var  feed = new Instafeed({
			target: name_of_tag,
			get: 'tagged',
			tagName: name_of_tag,
			clientId: 'bf5093520bb54d3cac22e936e98a3804',
			limit: 60
		});
	//Run the feed
	feed.run();


	}
}

instaGetter('lovemoore, lol, hey');