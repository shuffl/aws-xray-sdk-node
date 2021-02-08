/**
 * Represents a SQL database call.
 * @constructor
 * @param {string} databaseVer - The version on the database (user supplied).
 * @param {string} driverVer - The version on the database driver (user supplied).
 * @param {string} user - The user associated to the database call.
 * @param {string} queryType - The SQL query type.
 * @param {string} sanitizedQuery - The SQL query.
 */

function SqlData(databaseVer, driverVer, user, url, queryType, sanitizedQuery) {
  this.init(databaseVer, driverVer, user, url, queryType, sanitizedQuery);
}

SqlData.prototype.init = function init(databaseVer, driverVer, user, url, queryType, sanitizedQuery) {
  if (databaseVer)
    this.database_version = databaseVer;

  if (driverVer)
    this.driver_version = driverVer;

  if (queryType)
    this.preparation = queryType;

  this.url = url;
  this.user = user;
  this.sanitized_query = sanitizedQuery;
};

module.exports = SqlData;
