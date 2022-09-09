const argon2 = require("argon2");

// déterminer les options de hachage
const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (req, res, next) => {
  argon2
    // arguments du hachage : le password (body de la requête) et les options du hachage
    .hash(req.body.password, hashingOptions)
    .then((hashedPassword) => {
      // on récupère la valeur donnée par le hachage pour la donner à la constante hassedPAssword, puis on delete le password brut
      req.body.hashedPassword = hashedPassword;
      delete req.body.password;
      next();
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

module.exports = { hashPassword };
