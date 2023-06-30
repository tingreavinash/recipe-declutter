import { firestore } from "./FirebaseConfig";
import { doc, setDoc, getDocs, deleteDoc, addDoc, collection } from "@firebase/firestore";

class FirebaseUtils {
  static generateDocId(recipeData) {

    let sanitizedId = null;
    if(recipeData["@id"]){
      sanitizedId = recipeData["@id"].replace(/[^a-zA-Z0-9]/g, "_");
    } else if(recipeData?.datePublished){
      sanitizedId = recipeData?.datePublished.replace(/[^a-zA-Z0-9]/g, "_");
    } else if(recipeData?.url){
      sanitizedId = recipeData?.url.replace(/[^a-zA-Z0-9]/g, "_");
    } else {
      sanitizedId = recipeData?.name.replace(/[^a-zA-Z0-9]/g, "_");
    }
    return sanitizedId;
  }

  static async addRecipeToCollection(recipeData) {
    const favRecipesRef = collection(firestore, "favRecipes"); // Firebase creates this automatically
    try {
      const recipeId = this.generateDocId(recipeData);
      // console.log("recipeid: ", recipeId);
      // console.log("recipeData: ", recipeData);
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

  static async deleteRecipeFromCollection(recipeId) {
    const favRecipesRef = collection(firestore, "favRecipes"); // Firebase creates this automatically
    try {
      // console.log("recipeid: ", recipeId);
      await deleteDoc(doc(favRecipesRef, recipeId));
      console.log("Recipe removed from collection.");
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
      console.log("Fetched all recipes.");

      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

export default FirebaseUtils;
