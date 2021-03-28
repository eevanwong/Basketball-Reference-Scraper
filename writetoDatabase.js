const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.URI,
  neo4j.auth.basic(process.env.USER, process.env.PASS)
);
