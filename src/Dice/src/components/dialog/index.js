import { reactive } from "vue";

const dialogOptions = {
  title: "string",
  draggable: false,
  class: "string",
  component: null,
  props: undefined,
  width: "string",
  visible: undefined,
  callBack: undefined,
  fullscreen: false,
  customClass: "",
  closeOnPressEscape: true,
};

export const dialogList = reactive([]);

export const addDialog = (options) => {
  const existingDialog = dialogList.find((dialog) => dialog.title === options.title);
  if (!existingDialog) {
    dialogList.push(Object.assign(options, { visible: true, show: true }));
  }
};

export const closeDialog = (item, i, args, source = "native") => {
  dialogList.splice(i, 1);
  if (source === "callback" && item.callBack) {
    item.callBack(...args);
  }
};

export const clearAllDialogs = () => {
  dialogList.length = 0; // 清空所有對話框
};
