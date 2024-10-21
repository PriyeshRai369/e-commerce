import { app } from "./app.js";
import { dbConnect } from "./database/db.connect.js";

try {
  dbConnect().then(() => {
    app.get("/", (req, res) => {
      res
        .status(201)
        .json({ success: true, message: "App is listening at / page" });
    });
    app.listen(process.env.PORT, () =>
      console.log("App is running at:- ", process.env.PORT)
    );
  });
} catch (error) {
  console.log(error.message);
}
