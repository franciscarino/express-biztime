"use strict";

const express = require("express");

const router = new express.Router();
// if you don't need errors, don't include them
const {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
} = require("../expressError");

const db = require("../db");

/** get companies ]{companies: [{code, name}, ...]}*/
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name, description
           FROM companies`
  );
  const companies = results.rows;
  return res.json({ companies });
});

/** Return obj of company: {company: {code, name, description}} */
router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description
           FROM companies
           WHERE code = $1`,
    [code]
  );

  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ company });
});


/** Takes a company in this format: {code, name, description}
    Returns obj of a newly created company: {company: {code, name, description}}
*/
router.post("/", async function (req, res) {

  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies (code,name,description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    [code, name, description]);
  const companies = results.rows[0];

  return res.status(201).json({ companies });
});


/**Edits existing company
 * takes JSON {name, description}
 * returns {company: {code, name, description}}
 */
router.put("/:code", async function (req, res, next) {

  const code = req.params.code;
  const { name, description } = req.body;
  const results = await db.query(
    `UPDATE companies
           SET name=$1,
               description=$2
           WHERE code = $3
           RETURNING name, description,code`,
    [name, description, code]);
  const companies = results.rows[0];



  if (!companies) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ companies });
});


/**Deletes a company
 * Returns {status: "deleted"}
*/
router.delete("/:code", async function (req, res, next) {

  const code = req.params.code;

  const results = await db.query(
    `DELETE FROM companies WHERE code = $1
    RETURNING code`,
    [code],

  );

  const companies = results.rows[0];

  if (!companies) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ status: "deleted" });
});

module.exports = router;
