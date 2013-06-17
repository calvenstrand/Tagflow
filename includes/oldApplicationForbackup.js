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
    this.bind('add', this.addFlag, this); 
  }
 ,
  addFlag: function() {
      console.log('ADDED');
        /*$('#photo_container').append(_.template($('#photo_container').html(), {}));
    view = this;
      var photoView = new Moustagram.views.PhotoView({ model: photo });
     view.$el.append(photoView.render().el);*/
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

  tagName: "div",
  className: "photo",

  initialize: function() {
    console.log('PhotoView initialized');
  },

  render: function() {
    console.log('PhotoView rendering');
    img = new Image();
    img.src = this.model.get('images').thumbnail.url;
    this.$el.html(img);
    return this;
  }
});


Moustagram.views.PhotosView = Backbone.View.extend({

  id: "photo_container",
  template: "#photo_container",

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

  var Router = Backbone.Router.extend({

    routes: {
      "":             "index",
      "your_photos":  "your_photos",
      "your_friends": "your_friends",
      "popular":      "popular",
      "tags":         "tags"
    },

    initialize: function() {
      this.route(/^access_token=(.*?)$/, "access_token", this.access_token);
    },

    index: function(hash) {
      if (Moustagram.storage.getAccessToken()) {
        this.navigate('your_photos', { trigger: true });
      } else {
        var view = new Moustagram.views.AuthorizeView();
        $("#main").html(view.render().el);
      }
    },

    access_token: function(token) {
      Moustagram.storage.setAccessToken(token);
      this.navigate('photos', { trigger: true });
    },

    your_photos: function() {
      var photos = new Moustagram.collections.Photos();
      photos.url = Moustagram.config.feedUrl + Moustagram.storage.getAccessToken();
      var view = new Moustagram.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    },

    your_friends: function() {
      var photos = new Moustagram.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/users/self/feed?access_token=' + Moustagram.storage.getAccessToken();
      var view = new Moustagram.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    },

    popular: function() {
      var photos = new Moustagram.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/media/popular?access_token=' + Moustagram.storage.getAccessToken();
      var view = new Moustagram.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    },
    tags: function() {
      var photos = new Moustagram.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/tags/batman/media/recent/?access_token=' + Moustagram.storage.getAccessToken();
      var view = new Moustagram.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    }

  });

  router = new Router();

  if (!Backbone.history.start()) {
    $('body').html('404!');
  }
});
