
var businessData = new Array;
var markers = new Array;

var map;

var placeIds = [ "ChIJR6lwAHxskFQRTka_PHbS9TQ", "ChIJ3bYQeY53CEER9LMe4keT1yM", "ChIJe7q4I49skFQRB0reqf3Sl9U", "ChIJLVCIgn1skFQR0MkHaxQGR6Y", "ChIJ8eP5VY9skFQRj_eSuT7hnhM" ];

var numPlaces = placeIds.length;

function BusinessEntry(name) {
  var self = this;
  self.name = name;
  self.visible = ko.observable(true);
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

}

var mapsViewModel = new MapsViewModel();
ko.applyBindings(mapsViewModel);
console.log("foo");


function detailsCallback(index) {
  return function(results, status) {
    var newObject = $.extend(true, { }, results);
    businessData[index] = newObject;
    markers[index] = new google.maps.Marker({ map: map,
                                              position: newObject.geometry.location });

    mapsViewModel.entries.push(new BusinessEntry(newObject.name))
  }
}

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

      var randomString = function(length) {
          var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          for(var i = 0; i < length; i++) {
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
          return text;
      }

      function generateNonce() {
        return (Math.floor(Math.random() * 1e12).toString());
      }

      function cb(data) {        
        console.log("cb: " + JSON.stringify(data));
      }

      function callYelp()
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
        parameters.push(['term', terms]);
        parameters.push(['location', near]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
        
        var message = {
            'action' : 'https://api.yelp.com/v2/search',
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
                console.log('success[' + data + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
            }
        )
        .fail(function(jqXHR, textStatus, errorThrown) {
                            console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
                }
        );

      }

      callYelp();
} 

 $(document).ready(function() {

  });
