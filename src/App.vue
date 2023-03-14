<script setup>
import VTodoItem from './components/v-todo-item.vue'
</script>

<template>
  <main>
    <div class="container mx-auto w-[600px]">
      <div class="py-[30px]">
        <div class="mb-[20px]">
          <h1 class="text-[16px] font-bold">Today</h1>
        </div>

        <ul>
          <v-todo-item v-for="todo in 2" :key="todo"></v-todo-item>
        </ul>
      </div>
    </div>
  </main>
</template>

<style></style>
