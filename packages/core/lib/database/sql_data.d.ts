declare class SqlData {
  database_version?: string;
  driver_version?: string;
  preparation?: string;
  url?: string;
  user?: string;
  sanitizedQuery?: string;


  constructor(databaseVer?: string, driverVer?: string, user?: string, url?: string, queryType?: string, sanitizedQuery?: string);
}

export = SqlData;
