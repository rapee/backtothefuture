var qs = require('querystring');
var config = require('../config');
var log = require('../log');

var request = require('superagent');
var fs = require('fs');

var credentials = {
  clientId: 'q55y6zr45vueds2c7nkcx7pn',
  clientSecret: 'H7uv7VzwM9UgccvFy7BV7UMsYSejE22vhTDaTGPmkKn8r',
  site: 'https://connect.gettyimages.com/oauth2/token',
  callback_url: 'http://localhost:8000/search'
};

exports.register = function(app) {

  app.get('/', function(req, res) {
    if(!req.cookies.access_token){
      console.log('No token, will redirect to /gettoken');
      res.redirect('/gettoken');
    }
    res.render('index');
  });

  app.get('/gettoken', function(req, res){
    request.post(credentials.site)
    .send('client_id='+credentials.clientId)
    .send('client_secret='+credentials.clientSecret)
    .send('grant_type=client_credentials')
    .end(function(response){
      if(response.ok){
        var token_json = response.body;
        console.log('Getting token ->', token_json.access_token);
        res.cookie('access_token', token_json.access_token , {maxAge: parseInt(token_json.expires_in*1000)});
        res.redirect(req.query.redirect ||'/');
      }else{
        res.end(response.text);
      }
    });
  });

  app.get('/search', function(req,res){
    var params = req.query;
    console.log(params);
    if(!req.cookies.access_token){
      console.log('No token, will redirect to /gettoken');
      var paramsStr = qs.stringify(req.params);
      res.redirect('/gettoken?redirect=/search?'+paramsStr);
    }
    var searchOptions = JSON.parse(
      fs.readFileSync(__dirname+'/../service/image_search_template.json')
      );

    // set start and end date
    var dateRange = searchOptions.SearchForImagesRequestBody.Query.DateCreatedRange;
    dateRange.StartDate = typeof params.startdate != "undefined" ? params.startdate : "";
    dateRange.EndDate = typeof params.enddate != "undefined" ? params.enddate : "";
    // set SearchPhrase
    searchOptions.SearchForImagesRequestBody.Query.SearchPhrase = params.query? params.query : "apple";
    // get all resultOptions
    var resultOptions = searchOptions.SearchForImagesRequestBody.ResultOptions;
    // set number of items per page
    resultOptions.ItemCount = typeof params.itemperpage != "undefined" ? params.itemperpage : 5;
    // set start page
    resultOptions.ItemStartNumber = typeof params.startpage != "undefined" ? params.startpage : 1;
    // set sort by
    // Default - order by DateCreated, Date-submitted, ImageId descending (From oldest)
    // MostRecent - order by DateSubmitted descending (From Newest)
    // MostPopular - order by relevancy as determined from data gathered from customer interactions on Getty Images websites
    // Trending - similar to MostPopular, but with the most recent images first
    // TSMostPopular
    // BestMatch
    // DateSubmitted
    resultOptions.EditorialSortOrder = typeof params.sortby != "undefined" ? params.sortby : "Default";
    // add access_token to query
    searchOptions.RequestHeader.Token = req.cookies.access_token;
    console.log(searchOptions);
    request.post('https://connect.gettyimages.com/v2/search/SearchForImages')
      .send(searchOptions)
      .end(function(response){
        if(response.ok){
          console.log(response.body);
          res.json(response.body);
        }else{
          res.end(response.text);
        }
      });
  });

}
