const express = require("express");

// database access using knex
const knex = require("../data/dbConfig.js");

const router = express.Router();

// return a list of accounts from the database

router.get("/", (req, res) => {
    // select * from accounts
    knex
        .select("*")
        .from("accounts")
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