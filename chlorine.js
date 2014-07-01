/*jslint node: true*/
/*jslint nomen: true*/
var mysql = require('mysql'),
    pg = require('pg'),
    genericPool = require('generic-pool'),
    extend = require('xtend');

function mysqlExtendedPool(poolOptions, poolname, mysqlOptions) {
    'use strict';
    var pool = genericPool.Pool(extend({
        name: poolname,
        create: function (callback) {
            var client = mysql.createConnection(mysqlOptions);
            client.connect(function (error) {
                callback(error, client);
            });
            client.on('error', function (error) {
                console.log(error);
            });
            client.on('end', function () {
                if (!client._poolDestroyed) {
                    pool.destroy(client);
                }
            });
        },
        destroy: function (client) {
            if (client.state !== 'disconnected') {
                client._poolDestroyed = true;
                client.end();
            }
        }
    }, poolOptions));

    // If a minimum number of clients is set, then process.exit() can hang
    // unless the following listener is set.
    process.on("exit", function () {
        pool.drain(function () {
            pool.destroyAllNow();
        });
    });

    return {
        query: function (sql, bindvars, callback) {
            if (typeof bindvars === 'function') {
                callback = bindvars;
                bindvars = null;
            }

            pool.acquire(function (err, connection) {
                if (err) {
                    return callback(err);
                }

                var query = connection.query(sql, bindvars, function () {
                    console.log('** sql : ' + query.sql);
                    pool.release(connection);
                    callback.apply(this, arguments);
                });
                if (poolOptions.log) {
                    console.log(query.sql);
                }
            });
        },
        rawPool: pool
    };
}
function pgExtendedPool(poolOptions, poolname, pgOptions) {
    'use strict';
    //console.log(poolOptions);
    //console.log(pgOptions);
    var pool = genericPool.Pool(extend({
        name: poolname,
        create: function(callback) {
            var connectionString = 'postgres://' + pgOptions.user + ':'+pgOptions.password +
                                '@' + pgOptions.host + '/' + pgOptions.database,
                client = new pg.Client(connectionString);
            client.connect(function (error) {
                callback(error, client);
            });
            client.on('error', function(error) {
                console.log(error);
                //pool.destroy(client);
            });
            client.on('end', function() {
                if (!client._poolDestroyed) {
                    pool.destroy(client);
                }
            });
        },
        destroy: function(client) {
            // or just client.end() ?
            if (client.state !== 'disconnected') {
                client._poolDestroyed = true;
                client.end();
            }
        }
    }, poolOptions));

    // If a minimum number of clients is set, then process.exit() can hang
    // unless the following listener is set.
    process.on("exit", function() {
        pool.drain(function () {
            pool.destroyAllNow();
        });
    });

    return {
        query: function(sql, bindvars, callback) {
            if (typeof bindvars === 'function') {
                callback = bindvars;
                bindvars = null;
            }

            pool.acquire(function (err, connection) {
                if (err) {
                    return callback(err);
                }

                var query = connection.query(sql, bindvars, function () {
                    //console.log('** sql : ' + query.sql);
                    console.log('** sql: ' + query.text);
                    console.log('** sql: ' + query.values);
                    //console.log(JSON.stringify(query));
                    pool.release(connection);
                    callback.apply(this, arguments);
                });
                if (poolOptions.log) {
                    console.log(query.sql);
                }
            });
        },
        rawPool: pool
    };
}

exports.createPool = function (createPoolConfig) {
    if (createPoolConfig.type === 'postgres') {
        exports[createPoolConfig.poolName] = pgExtendedPool(createPoolConfig.poolConfig, createPoolConfig.name, createPoolConfig.dbConfig);
    } else {
        exports[createPoolConfig.poolName] = mysqlExtendedPool(createPoolConfig.poolConfig, createPoolConfig.name, createPoolConfig.dbConfig);
    }
};
