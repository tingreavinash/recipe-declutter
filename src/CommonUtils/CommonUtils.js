
import { toast } from "react-toastify";

class CommonUtils {

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
      }
      
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
      }
      
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
  