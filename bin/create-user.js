const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("password", salt);
const userRepo = require(
console.log(hash)
