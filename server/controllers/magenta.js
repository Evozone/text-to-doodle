import { magenta_words } from "../magenta_data.js";
import axios from "axios";

export const checkMagenta = async (req, res) => {
  const { word } = req.query;
  console.log(word);
  try {
    const check = magenta_words.some((element) => element === word);
    if (check === true) {
      console.log("word found in magenta_words");
      res.status(200).json({ flag: true, word: word });
    } else {
      const url = `${process.env.MAGENTA_WEAVIATE}/?query=${word}&limit=1`;
      const response = await axios.get(url);

      if (response.data.length > 0 && response.data[0].nameOfImage) {
        console.log("word found in magenta_weaviate");
        res
          .status(200)
          .json({ flag: true, word: response.data[0].nameOfImage });
      } else {
        const url = `${process.env.DOODLE_STROKE_WEAVIATE}/?query=${word}`;
        const response = await axios.get(url);
        console.log("word found in doodle_stroke_weaviate");
        res
          .status(200)
          .json({ flag: false, word: response.data[0].strokeOfImage });
      }
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const postStrokes = async (req, res) => {
  const { word, strokes } = req.body;
  //console.log(word, strokes);
  try {
    const url = `${process.env.DOODLE_STROKE_WEAVIATE}/add_stroke`;
    const response = await axios.post(url, { word: word, strokes: strokes });
    res.status(200).json({ message: "Strokes saved successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
