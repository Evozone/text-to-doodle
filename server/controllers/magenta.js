import { magenta_words } from "../magenta_data.js";
import axios from "axios";

export const checkMagenta = async (req, res) => {
  const { word } = req.query;

  try {
    const check = magenta_words.some((element) => element === word);
    if (check === true) {
      res.status(200).json({ flag: true, word: word });
    } else {
      const url = `${process.env.MAGENTA_WEAVIATE}/?query=${word}&limit=1`;
      const response = await axios.get(url);

      if (response.data.length > 0 && response.data[0].nameOfImage) {
        res
          .status(200)
          .json({ flag: true, word: response.data[0].nameOfImage });
      } else {
        const url = `${process.env.DOODLE_STROKE_WEAVIATE}/?query=${word}`;
        const response = await axios.get(url);
        res
          .status(200)
          .json({ flag: false, word: response.data[0].strokeOfImage });
      }
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
