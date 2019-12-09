const express = require("express");

// database access using knex
const knex = require("../data/dbConfig.js");

const router = express.Router();

// validators

function validateQuery(req, res, next) {
    const validFields = ["name", "id", "budget"];
    const validDirections = ["asc", "desc"];

    // Everything is included
    if (req.query && req.query.limit && req.query.sortby && req.query.sortdir) {
        if (Number.isInteger(Number(req.query.limit)) && (req.query.limit > 0) && validFields.includes(req.query.sortby) && validDirections.includes(req.query.sortdir)) {
            next();
        }
        else if (Number.isInteger(Number(req.query.limit)) && (req.query.limit > 0)) {
            res.status(400).json({ message: "Please enter valid sorting parameters in your query string." });
        }
        else if (validFields.includes(req.query.sortby) && validDirections.includes(req.query.sortdir)) {
            res.status(400).json({ message: "Please enter a positive integer for the limit in your query string." });
        }
        else {
            res.status(400).json({ message: "Please enter valid sorting parameters in your query string and a positive integer for the limit in your query string." });
        }
    // Limit only included
    } else if(req.query && req.query.limit) {
        if (Number.isInteger(req.query.limit) && (req.query.limit > 0)) {
            next();
        } else {
            res.status(400).json({ message: "Please enter a positive integer for the limit in your query string." });
        }
    // Sorting parameters only included
    } else if (req.query && req.query.sortby && req.query.sortdir) {
        if (validFields.includes(req.query.sortby) && validDirections.includes(req.query.sortdir)) {
            next();
        }
        else {
            res.status(400).json({ message: "Please enter valid sorting parameters in your query string." });
        }
    // Sorting category only included
    } else if (req.query && req.query.sortby) {
        if (validFields.includes(req.query.sortby)) {
            next();
        } else {
            res.status(400).json({ message: "Please enter a valid sorting field." });
        }
    // Sort direction only
    } else if (req.query && req.query.sortdir) {
        res.status(400).json({ message: "Please enter a valid sorting field along with the sorting direction." });
    }
    // Nothing
    else {
        next();
    }
}

// return a list of accounts from the database

router.get("/", validateQuery, (req, res) => {
    // select * from accounts
    console.log(req.query);
    const limit = req.query.limit;
    const sortby = req.query.sortby;
    const sortdir = req.query.sortdir;

    knex
        .select("*")
        .from("accounts")
        .limit(limit)
        .orderBy(sortby, sortdir)
        .then(accounts => {
        res.status(200).json(accounts);
        })
        .catch(err => {
        console.log(err);
            res.status(500).json({ error: "Error getting the list of users." });
        });
});

router.get("/:id", (req, res) => {
    // select * from accounts where id = req.params.id
    knex
        .select("*")
        .from("accounts")
        // .where("id", "=", req.params.id)
        .where({ id: req.params.id })
        .first()
        .then(account => {
            res.status(200).json(account);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "Error getting the account" });
        });
});

router.post("/", (req, res) => {
    // insert into () values ()
    const accountData = req.body;

    knex("accounts")
        .insert(accountData, "id")
        .then(ids => {
            const id = ids[0];
            return knex("accounts")
                .select("*")
                .where({ id })
                .first()
                .then(account => {
                    res.status(201).json(account);
                });
        }) 
        .catch(error => {
        console.log(error);
        res.status(500).json({
            error: "Error adding the account."
        });
    });
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const changes = req.body;

    // validate the data
    knex("accounts")
        .where({ id }) // ALWAYS FILTER ON UPDATE (AND DELETE)
        .update(changes)
        .then(count => {
        if (count > 0) {
            res.status(200).json({ message: `${count} account(s) updated` });
        } else {
            res.status(404).json({ message: "Account not found" });
        }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: "Error updating the account."
            });
        });
});

router.delete("/:id", (req, res) => {
    knex("accounts")
        .where({ id: req.params.id }) // ALWAYS FILTER ON UPDATE (AND DELETE)
        .del()
        .then(count => {
            if (count > 0) {
                res.status(200).json({ message: `${count} account(s) deleted` });
            } else {
                res.status(404).json({ message: "Account not found" });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "Error removing the account." });
        })
});



module.exports = router;