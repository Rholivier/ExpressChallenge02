const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

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

const verifyPassword = (req, res) => {
  argon2
    .verify(req.user.hashedPassword, req.body.password)
    .then((isVerified) => {
      if (isVerified) {
        // payload = informations du user encodées, sub = sujet (ie le user)
        const payload = { sub: req.user.id };
        // le jeton doit être signé avec une chaine secrète ("JWT_SECRET") stockée dans .env
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        // on supprime le password saisie et on envoie le token au user
        delete req.user.hashedPassword;
        res.send({ token, user: req.user });
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const verifyToken = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader == null) {
      throw new Error("Authorization header is missing");
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer") {
      throw new Error("Authorization header has not the 'Bearer' type");
    }

    req.payload = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
};

module.exports = { hashPassword, verifyPassword, verifyToken };
