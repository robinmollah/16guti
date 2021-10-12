const helmet = require("helmet");
const hsts = require("hsts");

function enableHttps(app){
    app.use(
        helmet({
          frameguard: false,
          contentSecurityPolicy: false,
        })
      );

      app.use(
        hsts({
          maxAge: 15552000, // 180 days in seconds
        })
      );

      //Setup http -> https redirect
      console.log("Redirecting http->https");
      app.use(function (req, res, next) {
        console.log("UseHTTPS app.use  ");
        if (!req.secure) {
          if (req.get("Host")) {
            const hostAddressParts = req.get("Host").split(":");
            let hostAddress = hostAddressParts[0];

            console.log("UseHTTPS hostAddressParts: " + hostAddressParts);
            console.log("UseHTTPS hostAddress: " + hostAddress);

            if (matchmakerhttpsPort != 443) {
              hostAddress = `${hostAddress}:${matchmakerhttpsPort}`;
            }
            const tytyhty = ["https://", hostAddress, req.originalUrl].join("");

            console.log("UseHTTPS res.redirect: " + tytyhty);

            return res.redirect(tytyhty);
          } else {
            console.error(
              `unable to get host name from header. Requestor ${
                req.ip
              }, url path: '${req.originalUrl}', available headers ${JSON.stringify(
                req.headers
              )}`
            );
            return res.status(400).send("Bad Request");
          }
        }
        next();
      });
};

module.exports.enable = enableHttps;
