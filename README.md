Chlorine keeps your (DB) pool clean!

Chlorine is very easy to use. Currently MySQL and Postgres databases are supported.

Chlorine works by spinning up one time use connections. A connection is created, a query is made, the result is returned, and the connection is closed and returned to the pool. This is all abstracted away so that all you need to do is create the pool and make queries.

### Installing Chlorine ###
To install Chlorine simply use NPM:

```sh
npm install chlorine
```

### Creating a Pool ###
To create a pool you will need to provide a configuration object for the database pool. Here's an example which utilizes all the options:

```js
var chlorine = require('chlorine');

var poolCreationConfig = {
    type: 'mysql', //Valid values are currently 'mysql' and 'postgres'. Chlorine will fallback on mySQL if an invalid value is passed.
    poolName: 'myPool', //The variable name of the pool
    poolConfig: {
        max: 25, //Maximum number of connections
        min: 0, //Minimum number of connections
        idleTimeoutMillis: 59000, //Amount of time before an idle connection expires
        log: false //Output debugging logs for the pool
    },
    name: 'MyDatabaseConnectionPool', //Name of the node generic pool
    dbConfig: {
        host: 'mydb.url.com', //URL to the database
        user: 'username', //Username to log in with
        password: 'correcthorsebatterystaple', //Password to log in with
        insecureAuth: false, //Whether to use old authentication or not
        debug: false //Provide debug logging for the DB
    }
};

chlorine.createPool(poolCreationConfig);
```

"But wait! You forgot to create a var for the pool, and now it is gone forever! YOU FOOL!"

Or did I?

### Making a Query ###
Pools are saved and managed by chlorine. You can access your pool through chlorine by the "poolName" option in the creation configuration. For example, let's make a query with the pool we created from the example above:

```js
chlorine.myPool.query('SELECT * FROM myTable WHERE id = ? AND name = ?', [7, 'Johnson'], function (error, data) {
    if (error) {
        console.log('Oh noes! An errorz!');
        console.log(error);
    } else {
        console.log('Success! Behold our results and tremble!');
        console.log(data);
    }
});
```

When you call `chlorine.poolName.query` Chlorine will create a connection to the database, make your query, get the results, then close the connection freeing it to be used elsewhere.

### Questions/Issues/Ideas? ###
If you encounter any issues, have any questions, or have an idea for Chlorine, please feel free to open up an issue or request ticket and we'll get back to you.
