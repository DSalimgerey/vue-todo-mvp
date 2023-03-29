<script setup>
import { ref, watch } from 'vue'
import VTodoItem from './components/v-todo-item.vue'

const todos = ref([
  {
    id: '1213',
    title: 'test',
    dueDate: '4-12-2023'
  }
])

const updateDueDate = ({ value, id }) => {
  const idx = todos.value.findIndex((t) => t.id === id)
  const todo = todos.value[idx]
  const updatedTodo = Object.assign(todo, { dueDate: value })
  todos.value.splice(idx, 1, updatedTodo)
}

watch(
  () => todos.value,
  (value) => console.log(value),
  { deep: true }
)
</script>

<template>
  <main>
    <div class="container mx-auto w-[600px]">
      <div class="py-[30px]">
        <div class="mb-[6px]">
          <h1 class="text-[16px] font-bold">Today</h1>
        </div>

        <ul>
          <v-todo-item
            v-for="todo in todos"
            :key="todo"
            :todo="todo"
            @update-date="updateDueDate($event)"
          ></v-todo-item>
        </ul>
      </div>
    </div>
  </main>
</template>

<style></style>
