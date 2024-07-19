import { connect } from "mongoose";

export const dbConfig = async () => {
  try {
    const URL: string = "mongodb://localhost:27017/testDB";

    return await connect(URL).then(() => {
      console.log("DB connected successfully 🥳🥵🥶");
    });
  } catch (error: any) {
    throw error;
  }
};
