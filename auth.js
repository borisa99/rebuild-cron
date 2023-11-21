const config = require("./config.json");

module.exports = (req, res, next) => {
  const token = req.headers.authorization
    ? req.headers.authorization?.split(" ")[1]
    : "";
  const user = config.find(({ key }) => key === token);
  if (!user) {
    return res.status(401).send("Unauthorized");
  }
  req.user = user;
  next();
};
