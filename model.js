const monk = require("monk");
const seqName = "UrlKeys";

var model = {};

module.exports = (function(){
    
    model.db_url = process.env.MAIN_DB || 'mongodb://localhost:27017/minute-url';
    
    model.db = monk(model.db_url);

    model.initDB = initDB;
    model.close = closeConnections;
    model.getKey = getKey;
    model.getUrl = getUrl;
    
    return model;
});

/**
 * Look up the address in db. If found it will return field 'key' of record.
 * Else it add record to db and return 'key' field of just added item.
 *
 * @param {url} url to store.
 * @param {callback(err, key)} call when address stored in db. Key is associated with url.
 * @public
 */
function getKey(url, callback){
    var urls = model.db.get('urls');
    urls.findOne({'url': url}, {'url': 1}, (err, doc) => {
        if(err) {
            callback(err, null);
        }
        else{
            if(doc != null){
                callback(err, doc.key);
            }
            else{
                getNextSequence(seqName, (err, res) => {
                    if(err) callback(err, null);
                    else{
                        var key = res.seq;
                        urls.insert({
                            'url': url,
                            'key': key
                        },
                        (err, result) => {
                            if(err) callback(err, null);
                            else{
                                callback(err, key);
                            }
                        });
                    }
                });
            }
        }
    });
}

/**
 * Look up the address in db. If found it will return field 'key' of record.
 * Else it return error.
 *
 * @param {url} url to store.
 * @param {callback(err, url)} call when address stored in db. Key is associated with url.
 * @public
 */
function getUrl(key, callback){
    var urls = model.db.get('urls');
    urls.findOne({'key': key}, {'url': 1}, (err, doc) => {
        if(doc != null){
            callback(err, doc.url);
        }
        else{
            if(err) callback(err, null);
            else callback("The key " + key + " does not exist!", null);
        }
    });
}

/**
 * Close all connections to database.
 *
 * @param {callback()} call when monk closed.
 * @public
 */
function closeConnections(callback) {
    model.db.close(callback);
}

/**
 * Return next integer value in sequence to callback function.
 *
 * @param {name} name of sequence.
 * @param {callback} function (err, newKey).
 * @public
 */
function getNextSequence(name, callback){
    model.db.get('counters').findOneAndUpdate({ 'seqName': name }, { $inc: { seq: 1 }}, {upsert: true}, callback);
}

/**
 * create tables and insert data as needed to start working.
 * @param{callback} emit function callback when ends.
 * @public
 */
function initDB() {
    console.log('Start to creade database.');
    var counters = model.db.get('counters');
    counters.find({ 'seqName': seqName }, {}, (err, answer) => {
        if (err) {
            console.error('Error finding counters:', err);
        }
        else if(answer.length > 0) {
            console.log('Counters are ready');
        }
        else{
            console.log('It needs to init counters!');
            counters.insert({
                'seqName': seqName,
                'seq': 0
            });
        }
        console.log('End creade database.');
        model.db.close();
    });
}