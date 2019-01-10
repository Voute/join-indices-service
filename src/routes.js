var es = require('elasticsearch');
var initiateLogger = require('./logger.js');

  const logger = initiateLogger.getLogger('ijs_main');
  logger.debug('Entering cheese testing');

var client = new es.Client(
    {hosts: [
        'http://localhost:9210'
    ]}
);

var indexCommand = {
    index:  { _index: null, _type: null }
}

var appRouter = function (app) {
    app.post('/test', function(req, res) {
        console.log('post test request is recieved');
        console.log(req.body.field1);
        res.status(200).send('test response');
        logger.debug('Entering cheese testing');
    });

    app.post('/readData', function(req, resp) {
        console.log('Request readData is received.');
        if (req.body) {
            let reqBody = req.body;
            let reqIndex, reqID;
            if (reqBody.index) {
                reqIndex = reqBody.index;
            }
            if (reqBody.id) {
                reqID = reqBody.id;
            }
            if (reqIndex && reqID) {
                console.log('Asking ES with following parameters: index: %s, id: %s', reqIndex, reqID);
                client.get({
                    index: reqIndex,
                    type: reqIndex,
                    id: reqID
                }, function(err, esResp, status) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(esResp);
                        resp.status(200).send(esResp);
                    }
                });
                // console.log(esResponse);
            }
        }
        

    });

    // /join_to_new
    // {
    //     source:
    //     [
    //     {
    //         index: 
    //         join_field:
    //         query: {}
    //         fields: []
    //     },
    //     {
    //         index:
    //         join_field:
    //         query: {}
    //         fields:
    //     }
    //     ],
    //     target:
    //     {
    //         name: 
    //     }
    // }


    app.post('/join_to_new', function(commandReq, commandResp) {
        logger.trace('join_to_new is requested, request body:%s', JSON.stringify(commandReq.body));

        let userResponse = {
            result: null,
            source1_count: 0,
            source2_count: 0
        }

        let reqBody = commandReq.body;
        if (reqBody.target.name) {
            indexCommand.index._index = reqBody.target.name;
        } else {
            userResponse.result = 'target.name is not specified';
            commandResp.status(400).send(userResponse);
            return;
        }

        let source1 = {
            index: reqBody.source[0].index,
            query: { query: reqBody.source[0].query},
            join_field: reqBody.source[0].join_field,
            join_field_unique: reqBody.source[0].join_field_unique,
            fields: reqBody.source[0].fields,
            count: 0
        }
        source1.fields.push(source1.join_field);

        let source2 = {
            index: reqBody.source[1].index,
            query: { query: reqBody.source[1].query},
            join_field: reqBody.source[1].join_field,
            join_field_unique: reqBody.source[1].join_field_unique,
            fields: reqBody.source[1].fields,
            count: 0
        }
        source2.fields.push(source2.join_field);
        let curDate = new Date();
        indexCommand.index._type = 'join_' + source1.index + '_' + source2.index + 
        curDate.getFullYear() + 
        curDate.getMonth().toLocaleString() + 
        curDate.getDay().toLocaleString();

        // let emptyParameter = false;

        // source1.fields.forEach(value => {
        //     if (value === null) {
        //         emptyParameter = true;
        //     }
        // });
        // source2.fields.forEach(value => {
        //     if (value === null) {
        //         emptyParameter = true;
        //     }
        // });

        // if (emptyParameter === true) {
        //     userResponse.result = 'Not all the parameters are specified';
        //     commandResp.status(400).send(userResponse);
        //     logger.error(userResponse.result);
        //     return;
        // }

        if (reqBody.source[0].join_field_unique) {
            sourceUniqueKeysConfig = source1;
            sourceTargetConfig = source2;
        } else if (reqBody.source[1].join_field_unique) {
            sourceUniqueKeysConfig = source2;
            sourceTargetConfig = source1;
        } else {
            userResponse.result = 'There is no source with join_field_unique specified';
            commandResp.status(400).send(userResponse);
            logger.error(userResponse.result);
            return;
        }

        logger.trace('Checking source1 hits');
        client.count(
            {
                index: source1.index,
                body: source1.query
            }
        ).then(function(countResponse1) {
            if (countResponse1.error) {
                userResponse.result = 'Error in getting count for source1';
                userResponse.error = countResponse1;
                commandResp.status(400).send(userResponse);
                logger.error(countResponse1);
            } else {
                logger.trace('Source1 hits: %s', countResponse1.count);
                userResponse.source1_count = countResponse1.count;

                logger.trace('Checking source2 hits');
                client.count(
                    {
                        index: source2.index,
                        body: source2.query
                    }
                ).then(function(countResponse2) {
                    if (countResponse2.error) {
                        userResponse.result = 'Error in getting count for source2';
                        userResponse.error = countResponse2;
                        commandResp.status(400).send(userResponse);
                        logger.error(countResponse2);
                    } else {
                        logger.trace('Source2 hits: %s', countResponse2.count);
                        userResponse.source2_count = countResponse2.count;
                        
                        if (countResponse1.count > 0 && countResponse1.count > 0) {
                            userResponse.result = 'Join is started';
                            commandResp.status(200).send(userResponse);
                            source1.count = countResponse1.count;
                            source2.count = countResponse2.count;
                            logger.trace(userResponse.result);
                            createJoinedIndex();
                        } else {
                            userResponse.result = 'One source is empty, nothing to join';
                            commandResp.status(200).send(userResponse);
                            logger.trace(userResponse.result);
                        }
                    }
                });
            }
        });

    });

}

var sourceUniqueKeysConfig;
var sourceTargetConfig;

var createJoinedIndex = function(){

    logger.trace('Joining the indices');
    // // let source, target;
    // if (source1.count < source2.count) {
    //     sourceUniqueKeysConfig = source1;
    //     sourceTargetConfig = source2;
    //     logger.trace('Source1 is source');
    //     logger.trace(source1);
    // } else {
    //     sourceUniqueKeysConfig = source2;
    //     sourceTargetConfig = source1;
    //     logger.trace('Source2 is source');
    //     logger.trace(source2);
    // }


    logger.trace('Starting scrolling');
    client.search({
        index: sourceUniqueKeysConfig.index,
        scroll: '20s', // keep the search results "scrollable" for 30 seconds
        _sourceInclude: sourceUniqueKeysConfig.fields, // filter the source to only include the title field
        body: sourceUniqueKeysConfig.query,
        size:500
    }, proceedScrollData);

}

var sourceUniqueKeysDocs = new Map();
var joinedDocsBulkInserts = [];
var totalDocsScrolled = 0;
var scroll_id;

var proceedScrollData = function (error, response) {
    if (error) {
        logger.error(error);
    } else {
        logger.trace('Documents scrolled: %s', response.hits.hits.length);
        totalDocsScrolled += response.hits.hits.length;
        logger.trace('Total docs scrolled: % s', totalDocsScrolled);
        // if (target) {
        response.hits.hits.forEach(function (hit) {
            sourceUniqueKeysDocs.set(hit._source[sourceUniqueKeysConfig.join_field_unique], hit._source);
        });
        logger.trace('Source docs are mapped with join fields as keys');
        let targetTerms = Array.from(sourceUniqueKeysDocs.keys());
        // let targetHits = 
        scroll_id = response._scroll_id;
        
        response.hits.total;
        searchForTerms(sourceTargetConfig, targetTerms);
        // let targetHits = collectAndPushSourcesData(target, null)

        // } else {
        //     resultHits.push(response.hits.hits);
        //     return resultHits;
        // }
    }
}

var proceedScrolling = function() {

    logger.trace('Proceeeding scrolling');
    if (totalDocsScrolled < sourceUniqueKeysConfig.count) {
        // now we can call scroll over and over
        client.scroll({
          scrollId: scroll_id,
          scroll: '20s'
        }, proceedScrollData);
    } else {
        logger.trace('all done: required records %s, hits processed %s', sourceUniqueKeysConfig.count, totalDocsScrolled);
    }
}

var joinResults = function(targetHits) {
    logger.trace('Joining the surce docs with target docs');
    targetHits.forEach(function (targetHit) {
        let sourceHit = sourceUniqueKeysDocs.get(targetHit._source[sourceTargetConfig.join_field]);
        Object.keys(sourceHit).forEach(key => {
            let fieldName = key;
            if (targetHit._source[key]) {
                fieldName = key + '_joined';
                let n = 0;
                while (targetHit._source[fieldName]) {
                    n++;
                    fieldName = key + '_joined' + n;
                }
            }
            targetHit._source[fieldName] = sourceHit[key];
        });
        // logger.trace('index command is' + JSON.stringify(indexCommand));
        joinedDocsBulkInserts.push(indexCommand);
        joinedDocsBulkInserts.push(targetHit._source);
    });
    insertJoinedData(sourceUniqueKeysDocs);
}

// client.bulk({
//     body: [
//       // action description
//       { index:  { _index: 'myindex', _type: 'mytype', _id: 1 } },
//        // the document to index
//       { title: 'foo' },

var insertJoinedData = function(joinedData) {

    logger.trace('Joined docs to be inserted: %s', joinedData.size);
    // logger.trace(JSON.stringify(joinedDocsBulkInserts));
    client.bulk({
        body: joinedDocsBulkInserts
    }, function(err, resp) {
        if (err) {
            logger.error(err);
        } else {
            resp.items = null;
            logger.trace('Docs are indexed, response: %s', resp);
            sourceUniqueKeysDocs.clear();
            proceedScrolling();
        }
    })
    
}

var searchForTerms = function(target, terms) {
    logger.trace('Searching for terms size: %s', terms.length);

    let query = {
        query: {
            bool: {
                must: [
                    target.query.query,
                    {
                        terms:
                        {
                            [target.join_field]: terms
                        }
                    }
                ]
            }
        }
    }

    client.search({
        index: target.index,
        _sourceInclude: target.fields, // filter the source to only include the title field
        body: query,
        size: terms.length
    }, function (error, response) {
        if (error) {
            logger.error(error);
        } else {
            joinResults(response.hits.hits);
        }
    }
    )

    //   response.hits.hits.forEach(function (hit) {

}

module.exports = appRouter;