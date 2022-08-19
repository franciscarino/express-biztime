"use strict";

const express = require("express");

const router = new express.Router();

const { NotFoundError } = require("../expressError");

const db = require("../db");
const { json } = require("express");

/**
 * Return info on invoices:
 * like {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
           FROM invoices`
  );
  const invoices = results.rows;
  return res.json({ invoices });
});

/**
 * Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 */
router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
           FROM invoices
           WHERE id = $1`,
    [id]
  );
  const invoice = iResults.rows[0];

  const compCode = invoice.comp_code;

  const cResults = await db.query(
    `SELECT code, name, description
          FROM companies
          WHERE code = '${compCode}'`
  );
  const company = cResults.rows[0];

  invoice.company = company;

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);

  return res.json({ invoice });
});

/**
 * Adds an invoice.
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async function (req, res, next) {
  const { comp_code, amt } = req.body;
  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
         VALUES ($1, $2)
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );
  const invoice = results.rows[0];

  return res.json({ invoice });
});

module.exports = router;
