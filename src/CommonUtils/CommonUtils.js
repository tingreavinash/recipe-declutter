import { toast } from "react-toastify";

class CommonUtils {
  static getImageUrl = (recipe) => {

    let recipeThumbnailUrl;
    const recipeImageField = recipe.image;

    console.log("type of image field: ", typeof recipeThumbnailUrl)

    if (typeof recipeImageField === "string") {
      recipeThumbnailUrl = recipeImageField;
    } else if (Array.isArray(recipeImageField)) {
      console.log("Recipe array for image: ", recipeImageField);

      if (typeof recipeImageField[0] === "string") {
        console.log("image: ", recipeImageField[0]);

        recipeThumbnailUrl = recipeImageField[0];
      }

      if (typeof recipeImageField[0] === "object" && recipeImageField[0].url) {
        recipeThumbnailUrl = recipeImageField[0].url;
      }
    } else if (typeof recipeImageField === "object" && recipeImageField.url) {
      recipeThumbnailUrl = recipeImageField.url;
    }
    console.log("Return value: ", recipeThumbnailUrl)

    return recipeThumbnailUrl;
  }

  static validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  static showErrorToast = async (message) => {
    return toast.error(message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  static showWarnToast = async (message) => {
    return toast.warn(message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  static showSuccessToast = async (message) => {
    toast.success(message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  static showToast = async (promiseFunc, toastMessage) => {
    const toastProperties = {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    };

    return await toast.promise(promiseFunc, {
      pending: {
        render() {
          return "Please wait";
        },
        position: toastProperties.position,
        autoClose: toastProperties.autoClose,
        hideProgressBar: toastProperties.hideProgressBar,
        closeOnClick: toastProperties.closeOnClick,
        pauseOnHover: toastProperties.pauseOnHover,
        draggable: toastProperties.draggable,
        progress: toastProperties.progress,
        theme: toastProperties.theme,
      },
      success: {
        render() {
          return toastMessage;
        },
        position: toastProperties.position,
        autoClose: toastProperties.autoClose,
        hideProgressBar: toastProperties.hideProgressBar,
        closeOnClick: toastProperties.closeOnClick,
        pauseOnHover: toastProperties.pauseOnHover,
        draggable: toastProperties.draggable,
        progress: toastProperties.progress,
        theme: toastProperties.theme,
      },
      error: {
        render() {
          return "Failed";
        },
        position: toastProperties.position,
        autoClose: toastProperties.autoClose,
        hideProgressBar: toastProperties.hideProgressBar,
        closeOnClick: toastProperties.closeOnClick,
        pauseOnHover: toastProperties.pauseOnHover,
        draggable: toastProperties.draggable,
        progress: toastProperties.progress,
        theme: toastProperties.theme,
      },
    });
  };
}

export default CommonUtils;
