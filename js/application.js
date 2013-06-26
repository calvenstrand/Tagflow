_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// Define a namespace
Moustagram = {
  models: {},
  collections: {},
  views: {}
};
var leIntervalStarted = false;
var currentCollection;
var MODE;


Moustagram.config = {
  clientId: "bf5093520bb54d3cac22e936e98a3804",
  feedUrl: "https://api.instagram.com/v1/users/self/media/recent?access_token=",
  tag: 'batman',

  getRedirectUrl: function () {
    return this.getRootUrl() + '/Hashtag';
  },

  getRootUrl: function () {
    return window.location.origin;
  }
}


Moustagram.storage = {

  getAccessToken: function () {
    return localStorage.getItem('accessToken'); // null if doesn't exist
  },

  setAccessToken: function (token) {
    localStorage.setItem('accessToken', token);
  },

  destroyAccessToken: function (token) {
    localStorage.clear();
  }
}


Moustagram.models.Photo = Backbone.Model.extend({
  initialize: function () {
    //console.log('Photo initialized');
  },
});


Moustagram.collections.Photos = Backbone.Collection.extend({
  model: Moustagram.models.Photo,
  initialize: function () {

  },
  parse: function (response) {
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

  initialize: function () {

    //console.log('PhotoView initialized');
   this.$el.hide();
  },

  render: function () {
     var le = this;
     var img;
      
    
    username = this.model.get('user').username;
    link = this.model.get('link');
    
    this.$el.append('<div style="display:hidden;" class="instaPost"></div>');
    this.$el.children('.instaPost').append('<span id="instaUser-container"><p class="instaUser"><a href="' + link + '">' + username + '</a></p></span>');
    this.$el.children('.instaPost').append('<a class="imgLink" href="' + link + '"></a>');
    img = new Image();
   

    
    this.$el.find('.instaPost').waitForImages(function() {
    // All descendant images have loaded, now slide up.
    $(img).load( function(){ 
                    //once image is loaded add it to the a and remove the preloading 
                   le.$el.find('.imgLink').append( img ); 
                    // do other stuff 
                     
                    le.$el.show();

                }); 
   

    $(this).fadeIn();
    
    
    
      
});
    img.src = this.model.get('images').low_resolution.url;
       

    return this;
  }
});


Moustagram.views.PhotosView = Backbone.View.extend({
  id: "instafeed",
  template: "#moustagram",

  initialize: function () {

    console.log('PhotosView initialized');
    var view = this;
    currentCollection = this.collection;
    currentCollection.bind('add', this.renderSingle, this);

    currentCollection.fetch({
      add: true,
      dataType: 'jsonp',
      success: function (collection, response) {
        console.log('completed fetch');
      },
      error: function (collection, response) {
        console.log('fetch fucked up');
      }
    });

    
      setInterval(function () {
        leIntervalStarted = true;
        console.log('starting fetch');
        currentCollection.fetch({
          remove: false,
          limit: 40,
          dataType: 'jsonp',
          success: function (collection, response) {
            console.log('completed fetch');
            //view.render();
          },
          error: function (collection, response) {
            console.log('fetch fucked up');
          }
        });
        //end of interval
      }, 7000);
    

  },

  //Not used atm render single instead of just render
  render: function () {
    console.log('PhotosView rendering');
    $(this.el).append(_.template($(this.template).html(), {}));
    view = this;
    _.each(currentCollection.models, function (photo) {
      var photoView = new Moustagram.views.PhotoView({
        model: photo
      });
      view.$el.append(photoView.render().el);
    });
    return this;
  },
  renderSingle: function (photo) {
    view = this;

    var photoView = new Moustagram.views.PhotoView({
      model: photo
    });
    if (!leIntervalStarted) {
      view.$el.append(photoView.render().el);
    } else {
      view.$el.prepend(photoView.render().el);

    }
    return this;
  }
});
//////////////////////////////////////////////////////////////////////////////


Moustagram.views.InfiniteView = Backbone.View.extend({
  id: "instafeed",
  template: "#moustagram",

  initialize: function () {
    console.log('INITING??');

    console.log('PhotosView initialized');
    var view = this;

    currentCollection = view.collection;
    currentCollection.bind('add', this.renderSingle, this);

    currentCollection.fetch({
      add: true,
      dataType: 'jsonp',
      success: function (collection, response) {

        console.log('completed fetch');
        //view.render();
        $(window).scroll(function() {
  // Modify to adjust trigger point. You may want to add content
  // a little before the end of the page is reached. You may also want
  // to make sure you can't retrigger the end of page condition while
  // content is still loading.
  if ($(window).scrollTop() == $(document).height() - $(window).height()) {
    console.log('lescroll');
    view.gettit(response);
  }
});
        

      },
      error: function (collection, response) {
        console.log('fetch fucked up');
      }
    });



  },
  gettit: function (response) {
    var view = this;

    var next_page;


    mj(response.pagination.next_max_id, response.pagination.next_url);

    function mj(max_id, nec) {

      if (typeof max_id === 'string' && max_id.trim() !== '') {
        next_page = nec; + "&max_id=" + max_id;
        console.log(next_page);
      }
      return next_page || url;
    }



    currentCollection.fetch({
      url: next_page,
      dataType: 'jsonp',
      success: function (collection, response) {
        console.log('completed fetch');
        var resp = response;
        $(window).unbind('scroll');
       
        $(window).scroll(function() {
  // Modify to adjust trigger point. You may want to add content
  // a little before the end of the page is reached. You may also want
  // to make sure you can't retrigger the end of page condition while
  // content is still loading.
  if ($(window).scrollTop() == $(document).height() - $(window).height()) {
    console.log('lescroll');
    view.gettit(response);
  }
});
        //view.render();
      },
      error: function (collection, response) {
        console.log('fetch fucked up');
      }
    });



  },  
  renderSingle: function (photo) {
    view = this;
    var photoView = new Moustagram.views.PhotoView({
      model: photo
    });
    if (!leIntervalStarted) {
      view.$el.append(photoView.render().el);
    } else {
      view.$el.prepend(photoView.render().el);
    }
    return this;
  }

});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
Moustagram.views.ErrorView = Backbone.View.extend({

  initialize: function (meta) {
    switch (meta.error_type) {
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


jQuery(function ($) {


  var Moustagrammer = {

    initialize: function () {
      console.log('tja');
    },
    //Run the script and put in which tag to show photos from.
    tvMode: function (tag) {
      MODE = 'tvMode';
      Moustagram.config.tag = tag;
      $("#choosenHash").html('#' + Moustagram.config.tag);
      var photos = new Moustagram.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/tags/' + Moustagram.config.tag + '/media/recent/?client_id=' + Moustagram.config.clientId + '&count=23';
      var view = new Moustagram.views.PhotosView({
        collection: photos
      });
      $("#moustagram").html(view.el);
    },
    infiniteMode: function (tag) {
      MODE = 'infiniteView';
      Moustagram.config.tag = tag;
      $("#choosenHash").html('#' + Moustagram.config.tag);
      var photos = new Moustagram.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/tags/' + Moustagram.config.tag + '/media/recent/?client_id=' + Moustagram.config.clientId + '&count=23';
      var view = new Moustagram.views.InfiniteView({
        collection: photos
      });
      $("#moustagram").html(view.el);
    }


  };
  //Run this motha
  Moustagrammer.infiniteMode('batman');

});