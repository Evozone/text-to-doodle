// const sdk = require('node-appwrite');

import sdk from "node-appwrite";
import { databases } from "../index.js";
export const googleSignUp = async (req, res) => {
  let { uid, email, name, photoURL, username } = req.body;
  console.log(uid, email, name, photoURL, username);
  try {
    const databaseId = "661f69d582109d094527";
    const collectionId = "661f730778c66732b727";
    const queryResult = await databases.listDocuments(
      databaseId,
      collectionId,
      [sdk.Query.equal("email", [email])]
    );

    if (queryResult.documents.length > 0) {
      return res.status(201).json({
        success: true,
        result: queryResult.documents[0],
        message: "User already exists",
      });
    } else {
      const document = {
        uid,
        email,
        name,
        photoURL,
        username,
      };
      const result = await databases.createDocument(
        databaseId,
        collectionId,
        sdk.ID.unique(),
        document
      );
      res.status(201).json({
        success: true,
        result: result,
        message: "User created",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
    console.log(error);
  }
};
