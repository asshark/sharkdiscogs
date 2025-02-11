/**
The data source for obtaining information from discogs.com.
@param {string} apiKey - Consumer key.
@param {string} apiSecret - Consumer secret. 
@param {string} type - One of release, master, artist.
Consumer key and Consumer secret can be obtained by this link : https://www.discogs.com/settings/developers
More info about Discogs API see here: https://www.discogs.com/developers
@example 
var discogs = new SharkDiscogs("Consumer key" ,"Consumer secret" , "release" );
var r = discogs.search(query);
result( r , function(id) { return discogs.extra(id);});
*/
function SharkDiscogs (apiKey , apiSecret, type) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.type = type;
}

function removeDiscogsSuffix(str) {
return str.replace(/\s\(\d+\)$/, '');
}

/**
Issue a search query to Discogs database.
@param {string} query - Search query.
*/
SharkDiscogs.prototype.search = function(query) {
  var result = http().get("https://api.discogs.com/database/search?q=" + encodeURIComponent(query) + "&key=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
  var json = JSON.parse(result.body);
  return json.results;  
}

/**
Issue a search query to Discogs database.
@param {string} code - Search barcodes.
*/
SharkDiscogs.prototype.barcode = function(code) {
  var result = http().get("https://api.discogs.com/database/search?barcode=" + encodeURIComponent(code) + "&key=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
  var json = JSON.parse(result.body);
  return json.results;  
}

/**
@param {string} id - The resource identifier.
*/
SharkDiscogs.prototype.extra = function(id) {
    var resultJson = http().get("https://api.discogs.com/" + this.type + "s/" + id + "?key=" + this.apiKey + "&secret=" + this.apiSecret);
    var result = JSON.parse(resultJson.body); 
    if (result.images !== undefined) 
        result['images'] = result.images.map(function(e) { return e.uri; }).join(); 
    if (result.videos !== undefined) 
        result['videos'] = result.videos.map(function(e) { return e.uri; }).join();     
    if (result.artists !== undefined)
        result['artists'] = result.artists.map(function(e) { return e.name; }).join();   
    if (result.tracklist !== undefined)  
        result['tracklist'] = result.tracklist.map(function(e) { return e.position + ". " + e.title + " " + e.duration; }).join("\n");     
    if (result.styles !== undefined)  
        result['styles'] = result.styles.join();     
    if (result.genres !== undefined)
        result['genres'] = result.genres.join();        
    return result;
}

SharkDiscogs.prototype.lookup = function(id) {
    var resultJson = http().get("https://api.discogs.com/" + this.type + "s/" + id + "?key=" + this.apiKey + "&secret=" + this.apiSecret);
    var result = JSON.parse(resultJson.body); 
    if (result.images !== undefined) 
        result['images'] = result.images.map(function(e) { return e.uri; }).join(); 
    if (result.videos !== undefined) 
        result['videos'] = result.videos.map(function(e) { return e.uri; }).join();     
    if (result.artists !== undefined)
	{
		result['artistID'] = result.artists[0].id;
		result['artistURL'] = result.artists[0].resource_url;
		result['artistThumb'] = result.artists[0].thumbnail_url;
		result['artists'] = result.artists.map(function(e) { return removeDiscogsSuffix(e.name); }).join();   
	}
    if (result.tracklist !== undefined)
	{  
		result['trackCount'] = result.tracklist.length;
	        result['tracklist'] = result.tracklist.map(function(e) { return e.position + ". " + e.title + " : " + e.duration; }).join("\n");
	}     
    if (result.styles !== undefined)  
        result['styles'] = result.styles.join();     
    if (result.genres !== undefined)
        result['genres'] = result.genres.join();        
    return result;
}

SharkDiscogs.prototype.lookupArtist = function(query) {
  //log(query)
  var uri = "https://api.discogs.com/" + "artists/" + query + "?key=" + this.apiKey + "&secret=" + this.apiSecret
  var resultJson = http().get(uri);
  var result = JSON.parse(resultJson.body);
  //log(resultJson.body)
  if (result.members !== undefined)
	{  
	        result['members'] = result.members.map(function(e) { 
				//log(e.name)
				return e.name;// + " - " + e.active; 
			}).join("\n");
		//result['trackCount'] = result.tracklist.length;
	} 
  return result;  
}

SharkDiscogs.prototype.lookupArtistReleases = function(query) {
  var uri = "https://api.discogs.com/" + "artists/" + query + "/releases?key=" + this.apiKey + "&secret=" + this.apiSecret;
  var resultJson = http().get(uri);
  var result = JSON.parse(resultJson.body);
  if (result.releases !== undefined)
  {
  	result['releases'] = result.releases.map(function(e) { 
				return e.year + " - " + e.title + " - " + e.role  + " / " + e.type; 
			}).join("\n");
  } 
  return result;  
}
