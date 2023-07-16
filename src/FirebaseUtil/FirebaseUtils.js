import { firestore, auth } from "./FirebaseConfig";
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
} from "@firebase/firestore";
import { FirebaseError } from "@firebase/util";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import App from "../App";
import CommonUtils from "../CommonUtils/CommonUtils";

class FirebaseUtils {
  static generateDocId(recipeData) {
    let sanitizedId = null;
    const regex = /[^a-zA-Z0-9]/g;
    if (recipeData?.mainEntityOfPage) {
      if (
        typeof recipeData?.mainEntityOfPage == "object" &&
        recipeData?.mainEntityOfPage["@id"]
      ) {
        sanitizedId = recipeData?.mainEntityOfPage["@id"]?.replace(regex, "_");
      } else if (typeof recipeData?.mainEntityOfPage == "string") {
        sanitizedId = recipeData?.mainEntityOfPage?.replace(regex, "_");
      }
    } else if (recipeData["@id"]) {
      sanitizedId = recipeData["@id"].replace(regex, "_");
    } else if (recipeData?.url) {
      sanitizedId = recipeData?.url.replace(regex, "_");
    } else if (recipeData?.datePublished) {
      sanitizedId = recipeData?.datePublished.replace(regex, "_");
    } else {
      sanitizedId = recipeData?.name.replace(regex, "_");
    }

    return encodeURIComponent(sanitizedId);
  }

  static async addRecipeToCollection(recipeData) {
    try {
      const recipeId = this.generateDocId(recipeData);

      await setDoc(
        doc(firestore, "users", auth.currentUser.uid, "favorites", recipeId),
        {
          updatedOn: Date.now(),
          recipeObject: recipeData,
        }
      );

      console.log("Recipe added to collection.");
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error(err);
        CommonUtils.showErrorToast(err.message);
      } else {
        console.log(err);
      }
    }
  }

  static async deleteRecipeFromCollection(recipeId) {
    const favRecipesRef = collection(firestore, "favRecipes"); // Firebase creates this automatically
    try {
      // console.log("recipeid: ", recipeId);
      await deleteDoc(
        doc(firestore, "users", auth.currentUser.uid, "favorites", recipeId)
      );
      console.log("Recipe removed from collection.");
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error(err);
        CommonUtils.showErrorToast(err.message);
      } else {
        console.log(err);
      }
      throw err;
    }
  }

  static async getAllRecipes() {
    const favRecipesRef = collection(
      firestore,
      "favRecipes",
      "user",
      auth.currentUser.uid
    ); // Firebase creates this automatically
    try {
      const favoritesRef = collection(
        doc(firestore, "users", auth.currentUser.uid),
        "favorites"
      );
      const allRecipes = await getDocs(favoritesRef);
      const result = [];

      allRecipes.forEach((recipe) => {
        // doc.data() is never undefined for query doc snapshots
        result.push({ id: recipe.id, data: recipe.data() });
      });
      console.log("Fetched all recipes.");

      return result;
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error(err);
        CommonUtils.showErrorToast(err.message);
      } else {
        console.log(err);
      }
      throw err;
    }
  }

  static createAccountWithEmailAndPass = async (credentials) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Signed in
      const user = userCredential.user;
      const q = query(
        collection(firestore, "users"),
        where("uid", "==", user.uid)
      );
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await setDoc(doc(firestore, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          authProvider: "emailPassword",
          email: user.email,
        });
      }
      // alert("Account created");
      CommonUtils.showSuccessToast("Account created!");
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error(err);
        CommonUtils.showErrorToast(err.message);
      } else {
        console.log(err);
      }
    }
  };

  static loginWithEmailAndPassword = async (credentials) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.username,
        credentials.password
      );

      // Signed in
      const user = userCredential.user;
      const q = query(
        collection(firestore, "users"),
        where("uid", "==", user.uid)
      );
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await setDoc(doc(firestore, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          authProvider: "google",
          email: user.email,
        });
      }

      const token = { token: user?.accessToken };
      return token;
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error(err);
        CommonUtils.showErrorToast(err.message);
      } else {
        console.log(err);
      }
      return null;
    }
  };

  static signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const res = await signInWithPopup(auth, provider);

      const user = res.user;
      const q = query(
        collection(firestore, "users"),
        where("uid", "==", user.uid)
      );
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await setDoc(doc(firestore, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          authProvider: "google",
          email: user.email,
        });
      }

      // Signed in
      const token = { token: user?.accessToken };
      return token;
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error(err);
        CommonUtils.showErrorToast(err.message);
      } else {
        console.log(err);
      }
      return null;
    }
  };
}

export default FirebaseUtils;
