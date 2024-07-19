import { Application, Request, Response } from "express";
import userRouter from "./routers/userRouter";

export const mainApp = (app: Application) => {
  try {
    app.use("/api/v1/", userRouter);

    app.set("view engine", "ejs");

    app.get("/view-html", (req: Request, res: Response) => {
      return res.render("index", {
        firstName: "j",
        lastName: "w",
        verifyCode: "3383",
      });
    });

    app.get("/", (req: Request, res: Response) => {
      try {
        return res.status(200).json({
          message: "Welcome to my API",
        });
      } catch (error: any) {
        return res.status(error?.status).json({
          status: error?.status,
          message: error?.message,
        });
      }
    });
  } catch (error) {
    throw error;
  }
};
