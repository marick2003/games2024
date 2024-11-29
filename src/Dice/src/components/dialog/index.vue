<template>
  <template v-for="(item, index) in dialogList" :key="index">
    <div v-show="item.show">
      <el-dialog
        class="dialog"
        :draggable="item.draggable"
        :title="item.title"
        :class="item.class"
        :width="item.width"
        :fullscreen="item.fullscreen"
        :close-on-press-escape="item.closeOnPressEscape"
        v-model="item.visible"
        :modal="true"
        :close-on-click-modal="true"
        @close="() => closeDialog(item, index, '', true)"
      >
        <component @update-title="updateDialogTitle(index, $event)" :is="item.component" v-bind="item.props" @close="(...args) => closeDialog(item, index, args)" />
      </el-dialog>
    </div>
  </template>
</template>

<script setup>
import { dialogList, closeDialog } from "./index";

const updateDialogTitle = (index, newTitle) => {
  dialogList[index].title = newTitle;
};
</script>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding-top: 10px;
}
:deep(.el-dialog__title) {
  display: inline-block;
}
</style>
