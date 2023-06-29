import { firestore } from "./FirebaseConfig";
import { doc, setDoc, getDocs, addDoc, collection } from "@firebase/firestore";

class FirebaseUtils {
  static replaceNonAlphanumeric(url) {
    return url != null ? url.replace(/[^a-zA-Z0-9]/g, "_") : Date.now();
  }

  static async addRecipeToCollection(recipeData) {
    const favRecipesRef = collection(firestore, "favRecipes"); // Firebase creates this automatically
    try {
      const recipeId = this.replaceNonAlphanumeric(recipeData?.["@id"]);
      console.log("recipeid: ", recipeId);
      console.log("recipeData: ", recipeData);
      await setDoc(doc(favRecipesRef, recipeId), {
        updatedOn: Date.now(),
        recipeObject: recipeData,
      });
      console.log("Recipe added to collection.");
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async getAllRecipes() {
    const favRecipesRef = collection(firestore, "favRecipes"); // Firebase creates this automatically
    try {
      const allRecipes = await getDocs(favRecipesRef);

      const result = [];

      allRecipes.forEach((recipe) => {
        // doc.data() is never undefined for query doc snapshots
        result.push({id: recipe.id, data: recipe.data()});
      });
      console.log("Fetched all recipes: ", result);

      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

export default FirebaseUtils;
