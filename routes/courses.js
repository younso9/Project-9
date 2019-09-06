const express = require("express");
const router = express.Router();
const { Course, User } = require("../models");
const bcrypt = require("bcryptjs");
const auth = require("basic-auth");

const authenticateUser = (req, res, next) => {
    const credentials = auth(req);
    if (credentials) {
        User.findOne({ where: { emailAddress: credentials.name } }).then(user => {
            if (user) {
                const authenticated = bcrypt.compareSync(
                    credentials.pass,
                    user.password
                );
                if (authenticated) {
                    req.logedUser = user;
                    next();
                } else {
                    res.status(401).json({ error: "access denied" });
                }
            } else {
                res.status(401).json({ error: "user does not exist" });
            }
        });
    } else {
        res.status(401).json({ error: "no credentials received" });
    }
};

router.get("/", (req, res) => {
    Course.findAll({
        attributes: [
            "title",
            "description",
            "estimatedTime",
            "materialsNeeded",
            "userId"
        ],
        include: [
            {
                model: User,
                as: "user"
            }
        ]
    }).then(courses => res.json(courses));
});

router.get("/:id", (req, res) => {
    Course.findOne({
        where: { id: req.params.id },
        attributes: [
            "title",
            "description",
            "estimatedTime",
            "materialsNeeded",
            "userId"
        ],
        include: [{ model: User, as: "user" }]
    }).then(course => {
        if (course) {
            res.json({ course });
        } else {
            res.status(404).json({ error: "course not found" });
        }
    });
});

router.post("/", authenticateUser, (req, res) => {
    const reqCourse = req.body;

    if (reqCourse.title) {
        Course.findOne({ where: { title: reqCourse.title } }).then(foundCourse => {
            if (foundCourse) {
                res.status(409).json({ error: "the course alredy exist" });
            } else {
                Course.create(reqCourse)
                    .then(createdCourse =>
                        res
                            .status(201)
                            .location(`/api/courses/${createdCourse.id}`)
                            .end()
                    )
                    .catch(err => {
                        let resCode = 0;
                        err.name === "SequelizeValidationError"
                            ? (resCode = 400)
                            : (resCode = 500);
                        let errors = [];
                        err.errors.forEach(error => errors.push(error.message));
                        res.status(resCode).json({ errors: errors });
                    });
            }
        });
    } else {
        res.status(400).json({ error: "title is required" });
    }
});

router.put("/:id", authenticateUser, (req, res) => {
    const reqCourse = req.body;

    if (reqCourse.title && reqCourse.description) {
        Course.findByPk(req.params.id).then(foundCourse => {
            if (foundCourse) {
                if (foundCourse.userId === req.logedUser.id) {
                    foundCourse
                        .update(reqCourse)
                        .then(() => res.status(204).end())
                        .catch(err => {
                            let resCode = 0;
                            err.name === "SequelizeValidationError"
                                ? (resCode = 400)
                                : (resCode = 500);
                            let errors = [];
                            err.errors.forEach(error => errors.push(error.message));
                            res.status(resCode).json({ errors: errors });
                        });
                } else {
                    res
                        .status(403)
                        .json({ error: "current user doesn't own the requested course" });
                }
            } else {
                res.status(404).json({ error: "course not found" });
            }
        });
    } else {
        const errors = [];
        reqCourse.title ? null : (errors.push("title is required"));
        reqCourse.description ? null : (errors.push("description is required"));
        res.status(400).json({ errors });
    }
});

router.delete("/:id", authenticateUser, (req, res) => {
    Course.findByPk(req.params.id).then(foundCourse => {
        if (foundCourse) {
            if (foundCourse.userId === req.logedUser.id) {
                foundCourse.destroy().then(() => res.status(204).end());
            } else {
                res
                    .status(403)
                    .json({ error: "current user doesn't own the requested course" });
            }
        } else {
            res.status(404).json({ error: "course not found" });
        }
    });
});

module.exports = router;