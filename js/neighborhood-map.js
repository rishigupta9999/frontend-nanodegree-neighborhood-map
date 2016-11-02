
var businessData = new Array;
var markers = new Array;

var map;
var infoWindow;

var placeIds = [ "ChIJR6lwAHxskFQRTka_PHbS9TQ", "ChIJ3bYQeY53CEER9LMe4keT1yM", "ChIJe7q4I49skFQRB0reqf3Sl9U", "ChIJLVCIgn1skFQR0MkHaxQGR6Y", "ChIJ8eP5VY9skFQRj_eSuT7hnhM" ];
var yelpIds = [ "lot-no-3-bellevue", "tavern-hall-bellevue-2", "earls-kitchen-bar-bellevue", "chantanee-thai-restaurant-and-bar-bellevue-2", "cactus-restaurants-bellevue"];
var numPlaces = placeIds.length;
var curSelection = -1;

// Knockout bindings
function BusinessEntry(name, index, position) {
  var self = this;
  self.name = name;
  self.visible = ko.observable(true);
  self.index = index;
  self.position = position;
}

function listItemClicked(index, position)
{
    var selector = "#list-item-" + position;
    $(selector).addClass("active");

    if (curSelection != -1)
    {
      selector = "#list-item-" + curSelection;
      $(selector).removeClass("active");
    }

    markers[position].setAnimation(google.maps.Animation.BOUNCE);
    
    setTimeout(function() {
      markers[position].setAnimation(null);
    }, 2000);

    curSelection = position;

    callYelp(index, function(data, status, obj) {
      if (status == "success")
      {
        contentString = "<div class=\"container\" style=\"max-width: 400px\">"
        contentString += "<div class=\"row\"><div class=\"col-md-12\"><a href=\"" + data.url + "\"><span style=\"font-size: 2em\">" + data.name + "</span></a></div></div>"
        contentString += "<div class=\"row\"><div class=\"col-md-4\"><img src=\"" + data.image_url + "\"></img></div>"
        contentString += "<div class=\"col-md-8\">";
        contentString += "<div><img src=\"" + data.rating_img_url + "\" style=\"padding-right: 10px\">Reviews: " + data.review_count + "</div>";
        contentString += "<div>" + data.snippet_text + "</div>";
        contentString += "</div>";
        contentString += "</div>"

        if (infoWindow != null)
        {
          infoWindow.close();
        }

        infoWindow = new google.maps.InfoWindow({
          content: contentString
        });

        infoWindow.open(map, markers[index]);
        infoWindow.addListener('closeclick', function() {
          console.log("blar");
        })
      }
    });
}

function MapsViewModel() {
  var self = this;

  self.entries = ko.observableArray([]);

  self.filterText = ko.observable();
  self.filterText.subscribe(function() {

    filterVal = self.filterText().toUpperCase();

    for (var i = 0; i < self.entries().length; i++)
    {
      var searchPos = self.entries()[i].name.toUpperCase().search(filterVal);
      self.entries()[i].visible(searchPos != -1);
    }

  });

  self.listItemClick = function(clickedItem) {
    listItemClicked(clickedItem.index, clickedItem.position);
  }

}

function callYelp(index, callback)
{
  // Taken from https://gist.github.com/mnemonicflow/1b90ef0d294c692d24458b8378054c81
  var auth = {
      //
      // Update with your auth tokens.
      //
      consumerKey : "-pWwtJNSnVLOO9Pdg_cMIg",
      consumerSecret : "yraE9tmTtbEmqpK-JZWr0LNzVAM",
      accessToken : "BFicTaElfzTEcUwrgS74jCruU_KDYpmH",
      // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
      // You wouldn't actually want to expose your access token secret like this in a real application.
      accessTokenSecret : "OKPP3YR2yp_ZSY5frmE0SgvKrkg",
      serviceProvider : {
          signatureMethod : "HMAC-SHA1"
      }
  };
  
  var terms = 'food';
  var near = 'San+Francisco';

  var accessor = {
      consumerSecret : auth.consumerSecret,
      tokenSecret : auth.accessTokenSecret
  };

  var parameters = [];
  parameters.push(['callback', 'cb']);
  parameters.push(['oauth_consumer_key', auth.consumerKey]);
  parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  parameters.push(['oauth_token', auth.accessToken]);
  parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
  
  var message = {
      'action' : 'https://api.yelp.com/v2/business/' + yelpIds[index],
      'method' : 'GET',
      'parameters' : parameters
  };
  
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  var parameterMap = OAuth.getParameterMap(message.parameters);
      
  $.ajax({
      'url' : message.action,
      'data' : parameterMap,
      'dataType' : 'jsonp',
      'jsonpCallback' : 'cb',
      'cache': true
  })
  .done(function(data, textStatus, jqXHR) {
    callback(data, textStatus, jqXHR);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    callback(errorThrown, textStatus, jqXHR);
  });

}

var mapsViewModel = new MapsViewModel();
ko.applyBindings(mapsViewModel);


// Called when a marker is clicked.  This calls through to the click handler
function listenerCallback(index, position) {
  return function() {
    listItemClicked(index, position);
  }
}

// Called once the Places Service returns.  This is needed to populate the names of the businesses
// and the marker positions.
function detailsCallback(index) {
  return function(results, status) {
    var newObject = $.extend(true, { }, results);
    businessData[index] = newObject;
    markers[index] = new google.maps.Marker({ map: map,
                                              position: newObject.geometry.location });

    position = mapsViewModel.entries().length;
    mapsViewModel.entries.push(new BusinessEntry(newObject.name, index, position));

    markers[index].addListener('click', listenerCallback(index, position));
  }
}

// This function kicks off the entire application.  Nothing much can happen without the map.
function initMap() {

  var bellevue = new google.maps.LatLng(47.6135016, -122.2003407);

  map = new google.maps.Map(document.getElementById('map'), {
    center: bellevue,
    zoom: 15
  });

  service = new google.maps.places.PlacesService(map);

  for (var i = 0; i < numPlaces; i++) {
    var request = { placeId: placeIds[i] };
    service.getDetails(request, detailsCallback(i));
  }

  function cb(data) {        
    //console.log("cb: " + JSON.stringify(data));
  }
}

$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyB0HNcrSFVlgw9gqoS00QNSvnuWLNmVEXI&callback=initMap&libraries=places").fail(function() {
  $(".error-window").fadeIn();
  $(".error-window").text("Could not connect to Google Maps");
});

$(document).ready(function() {



});
