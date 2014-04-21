var http = require('http');
var path = require('path');

var express = require('express');

var request = require('request');

var MongoClient = require('mongodb').MongoClient;

// Configure the Express web server
var router = express();
var server = http.createServer(router);

// Tell Express to serve static assets
router.use(express.static(path.resolve(__dirname, 'client')));
router.use(express.bodyParser());
router.use(express.methodOverride());
router.use(express.urlencoded());

// Tell Express to use EJS
router.set('view engine', 'ejs');

// Connect to the database; nothing else should happen until that connection is established.
MongoClient.connect('mongodb://yotam:monodb444@ds033069.mongolab.com:33069/yotam', function(err, db) {
    if (err) throw err;
    
    // Get a reference to the "greatests" collection in the database.
    // If this collection doesn't already exist in the db, it will be created automatically
    // the first time it's needed.
    var greatests = db.collection('greatests');

    // Serve the index page (the form)
    router.get('/', function(req, res) {
        res.render('index');
    });
    
    // Serve the list page, where we should also add a new greatest to the database
    router.post('/list', function(req, res) {
        var name = req.body.greatest;
        
        
        
        // Create or update this document in the database, with an incremented vote count
        greatests.update({name: name}, {$inc: {votes: 1}}, {upsert: true}, function(err) {
            if (err) throw err;
            
            // When that's done, get all documents, sorted descending by vote count, and convert to an array
            greatests.find().sort({votes: -1}).toArray(function(err, list) {
                if (err) throw err;
                
                // Sum up the total votes
                var total_votes = 0;
                list.forEach(function(item) {
                    total_votes += item.votes;
                });
                
                // Add percentages to each item
                if (total_votes > 0) {
                    list.forEach(function(item) {
                       item.percent = item.votes / total_votes * 100; 
                    });
                }
                
                var urlStringz1 = [];                
                var urlStringz2 = [];

                //https://ajax.googleapis.com/ajax/services/search/images?v=1.0&imgc=mono&q=pizza

                request('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&imgc=mono&q=' + list[0].name,
                
                function(error, response, body) {
            
                    if (!error && response.statusCode == 200) {
                    	//getting the image for the top result
                        console.log('-----------------------------------');
                        console.log(list[0].name);
                        console.log('-----------------------------------');
                        console.log(body);
                        var imgResults = JSON.parse(body).responseData.results;
                        console.log(imgResults);
                            
                        imgResults.forEach(function(result) {
                            if (result.url) {
                                console.log(result.url);
                                urlStringz1.push(result.url);
                            }
                        });
            
                        console.log(urlStringz1);
                        console.log('-------------------');
                        console.log(urlStringz1[0]);

		                request('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&imgc=mono&q=' + name,
		                
		                function(error, response, body) {
                    	//getting the image for the last submission
		            
		                    if (!error && response.statusCode == 200) {
		                        console.log('-----------------------------------');
		                        console.log(name);
		                        console.log('-----------------------------------');
		                        console.log(body);
		                        var imgResults = JSON.parse(body).responseData.results;
		                        console.log(imgResults);
		                            
		                        imgResults.forEach(function(result) {
		                            if (result.url) {
		                                console.log(result.url);
		                                urlStringz2.push(result.url);
		                            }
		                        });
		            
		                        console.log(urlStringz2);
		                        console.log('-------------------');
		                        console.log(urlStringz2[0]);
		                        // Render the view
		                        res.render('list', {list: list, total_votes: total_votes, urlString1:urlStringz1[0],urlString2:urlStringz2[0] });//the url for the last submissiion img });
		                    }
		                });


                    }
                });
                
                
            });

        });
      
       
    });
    
    router.get('/list', function(req, res) {
        // When that's done, get all documents, sorted descending by vote count, and convert to an array
            greatests.find().sort({votes: -1}).toArray(function(err, list) {
                if (err) throw err;
                
                // Sum up the total votes
                var total_votes = 0;
                list.forEach(function(item) {
                    total_votes += item.votes;
                });
                
                // Add percentages to each item
                if (total_votes > 0) {
                    list.forEach(function(item) {
                       item.percent = item.votes / total_votes * 100; 
                    });
                }

                var urlStringz = [];
                
                //https://ajax.googleapis.com/ajax/services/search/images?v=1.0&imgc=mono&q=pizza

                request('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&imgc=mono&rsz=1&q=' + list[0].name,
                
                function(error, response, body) {
            
                    if (!error && response.statusCode == 200) {
                    	//getting the image for the top result
                        console.log('-----------------------------------');
                        console.log(list[0].name);
                        console.log('-----------------------------------');
                        console.log(body);
                        var imgResults = JSON.parse(body).responseData.results;
                        console.log(imgResults);
                            
                        imgResults.forEach(function(result) {
                            if (result.url) {
                                console.log(result.url);
                                urlStringz1.push(result.url);
                            }
                        });
            
                        console.log(urlStringz1);
                        console.log('-------------------');
                        console.log(urlStringz1[0]);

		                request('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&imgc=mono&q=' + name,
		                
		                function(error, response, body) {
                    	//getting the image for the last submission
		            
		                    if (!error && response.statusCode == 200) {
		                        console.log('-----------------------------------');
		                        console.log(name);
		                        console.log('-----------------------------------');
		                        console.log(body);
		                        var imgResults = JSON.parse(body).responseData.results;
		                        console.log(imgResults);
		                            
		                        imgResults.forEach(function(result) {
		                            if (result.url) {
		                                console.log(result.url);
		                                urlStringz2.push(result.url);
		                            }
		                        });
		            
		                        console.log(urlStringz2);
		                        console.log('-------------------');
		                        console.log(urlStringz2[0]);
		                        // Render the view
		                        res.render('list', {list: list, total_votes: total_votes, urlStringz1:urlStringz1[0],urlStringz2:urlStringz2[0] //the url for the last submissiion img });
		                    }
		                });


                    }
                });
                                
            });
    });

    // Start our web server
    server.listen(process.env.PORT);

});
