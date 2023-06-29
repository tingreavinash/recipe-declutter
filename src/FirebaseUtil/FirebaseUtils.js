import { firestore } from "./FirebaseConfig"
import { addDoc, collection } from "@firebase/firestore"

class FirebaseUtils {
  

  static async addRecipeToCollection(recipeData) {
    const ref = collection(firestore, "favRecipes"); // Firebase creates this automatically
    try {
        await addDoc(ref, recipeData);
        console.log("Recipe added to collection.");
      } catch (err) {
        console.log(err);
        throw err;
      }
  };



}

export default FirebaseUtils;