_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

// Define a namespace
Moustagram = {
  models: {},
  collections: {},
  views: {}
};

var currentCollection;
Moustagram.config = {
  clientId: "bf5093520bb54d3cac22e936e98a3804",
  feedUrl: "https://api.instagram.com/v1/users/self/media/recent?access_token=",
  tag: 'batman',

  getAuthorizationUrl: function() {
    return _.template(this.authorizationUrl, {
      clientId: encodeURIComponent(this.clientId),
      redirectUri: encodeURIComponent(this.redirectUrl)
    });
  },

  getAuthorizationUrl: function() {
    return "https://instagram.com/oauth/authorize/?client_id=" + this.clientId + "&redirect_uri=" + this.getRedirectUrl() + "&response_type=token"
  },

  getRedirectUrl: function() {
    return this.getRootUrl()+'/Hashtag';
  },

  getRootUrl: function() {
    return window.location.origin;
  }
}


Moustagram.storage = {

  getAccessToken: function() {
    return localStorage.getItem('accessToken'); // null if doesn't exist
  },

  setAccessToken: function(token) {
    localStorage.setItem('accessToken', token);
  },

  destroyAccessToken: function(token) {
    localStorage.clear();
  }
}


Moustagram.models.Photo = Backbone.Model.extend({
  initialize: function() {
    console.log('Photo initialized');
  },
});


Moustagram.collections.Photos = Backbone.Collection.extend({
  model: Moustagram.models.Photo,
  initialize: function() {
   
  },
  parse: function(response) {
    if (response.meta.code == 200) {
      return response.data;
    } else {
      new Moustagram.views.ErrorView(response.meta);
    }
  },

});


Moustagram.views.PhotoView = Backbone.View.extend({

  tagName: "li",
  className: "",

  initialize: function() {
    console.log('PhotoView initialized');
  },

  render: function() {
    console.log(this.model);
    console.log('PhotoView rendering');
    username = this.model.get('user').username;
    link = this.model.get('link');
    
    img = new Image();
    img.src = this.model.get('images').standard_resolution.url;
    this.$el.append('<div class="instaPost"></div>');
    this.$el.children('.instaPost').append('<span id="instaUser-container"><p class="instaUser"><a href="'+link+'">'+username+'</a></p></span>');
    this.$el.children('.instaPost').append('<a class="imgLink" href="'+link+'"></a>');
    this.$el.find('.imgLink').append(img);
    //.append(img);
    return this;
  }
});


Moustagram.views.PhotosView = Backbone.View.extend({

  id: "instafeed",
  template: "#moustagram",

  initialize: function() {
    console.log('PhotosView initialized');
    var view = this;
    
    currentCollection = this.collection;
    currentCollection.bind('add', this.renderSingle, this);
    currentCollection.fetch({
      add:true, 
      dataType : 'jsonp',
      success: function(collection, response) {
        console.log('completed fetch');
        //view.render();
      },
      error: function(collection, response) {
        console.log('fetch fucked up');
      }
    });
    
   setInterval(function(){
      console.log('starting fetch');
      currentCollection.fetch({
        
      remove:false,
     
      limit:40,      
      dataType : 'jsonp',
      success: function(collection, response) {
        console.log('completed fetch');

        //view.render();
      },
      error: function(collection, response) {
        console.log('fetch fucked up');
      }
    });
    //end of interval
    },7000);
   
  },
  //Not used atm render single instead of just render
  render: function() {
    console.log('PhotosView rendering');
    $(this.el).append(_.template($(this.template).html(), {}));
    view = this;
    _.each(currentCollection.models, function(photo) {
      var photoView = new Moustagram.views.PhotoView({ model: photo });
      view.$el.append(photoView.render().el);
    });
    return this;
  },
  renderSingle: function(photo) {
    
    view = this;
      var photoView = new Moustagram.views.PhotoView({ model: photo });
      view.$el.prepend(photoView.render().el);
      //$('#photo_container').prepend(photoView.render().el);
    return this;
  }
});




Moustagram.views.AuthorizeView = Backbone.View.extend({
  id: "authentication",
  template: "#authentication",

  initialize: function() {
    console.log("Initialised AuthorizeView");

  },

  render: function() {
    this.$el.html(_.template($(this.template).html(), {
      authorizationUrl: Moustagram.config.getAuthorizationUrl()
    }));
    return this;
  }
});


Moustagram.views.ErrorView = Backbone.View.extend({

  initialize: function(meta) {
    switch(meta.error_type) {
        case 'OAuthAccessTokenException':
          error = "Moustagram does not have permission to access your Instagram account. <a href='/'>Authenticate</a>"
          Moustagram.storage.destroyAccessToken();
          break;
        default:
          error = "An unknown error occurred"
    }
    $('#main').html("<p>" + error + "</p>");
  }
});


jQuery(function($) {

 
  var Moustagrammer = {

    

  initialize: function() {
      console.log('tja');
    },
  run: function() {
     $("#choosenHash").html('#' + Moustagram.config.tag);
      var photos = new Moustagram.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/tags/'+Moustagram.config.tag+'/media/recent/?client_id=' + Moustagram.config.clientId;
      //photos.url = 'https://api.instagram.com/v1/tags/batman/media/recent/?access_token=' + Moustagram.storage.getAccessToken();
      var view = new Moustagram.views.PhotosView({ collection: photos });
      $("#moustagram").html(view.el);
    }

  };

  Moustagrammer.run();

 
});
