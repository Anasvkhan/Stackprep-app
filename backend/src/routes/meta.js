const router = require('express').Router();
const { ROLES, LEVELS, CATEGORIES } = require('../config/constants');

router.get('/', (req, res) => res.json({ roles: ROLES, levels: LEVELS, categories: CATEGORIES }));

module.exports = router;
