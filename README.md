# Setup
This project only uses NPM to install OAuth Signature.  This is needed by the Yelp API.

The index.html file will load OAuth Signature from the dist directory.  But the entire project is not copied into the dist directory since there's no usage of Gulp or similar.

# Description
This is the Udacity Front End Developer Neighborhood Map assignment.  It uses Knockout.js to simplify managing the view, and binding model state changes to the view.

5 hardcoded locations are looked up via the Google Places service to display the markers and populate the list on the left.  When a marker or location is clicked, a call is made via the Yelp API to retrieve information about the business such as their rating score, icon and excerpt from a review.

Search is implementing by subscribing to state changes, and doing a basic Javascript pattern search.  Any business with a name that has a pattern match, is shown.

Errors are shown in a red bar on the top.  By default, the div that displays the errors is hidden.

# Usage
Once everything is loaded, click a marker or map to view business information.  Enter text in the search bar on the top left to filter.
