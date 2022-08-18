"use strict";

const express = require("express");

const router = new express.Router();

const {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
} = require("../expressError");

const db = require("../db");

router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name, description
           FROM companies`
  );
  const companies = results.rows;
  return res.json({ companies });
});

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

// router.post("/", function (req, res) {});

// router.put("/:code", function (req, res) {});

// router.delete("/:code", function (req, res) {});

module.exports = router;
