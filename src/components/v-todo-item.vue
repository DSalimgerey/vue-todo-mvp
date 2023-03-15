<script>
import VDropdown from './dropdown/v-dropdown.vue'

const todoOptions = [
  {
    key: 'edit',
    text: 'Edit task'
  },
  {
    key: 'go_to_project',
    text: 'Go to project'
  },
  {
    key: 'divider'
  },
  {
    key: 'sub',
    text: 'sub menu',
    items: [
      {
        key: 'edit-1',
        text: 'Edit task'
      },
      {
        key: 'go_to_project-2',
        text: 'Go to project',
        items: [
          {
            key: 'test',
            text: 'some other sub item'
          },
          {
            key: 'test-1',
            text: 'some other sub item 1'
          },
          {
            key: 'divider'
          },
          {
            key: 'tes-2',
            text: 'compose'
          }
        ]
      }
    ]
  },
  {
    key: 'divider'
  },
  {
    key: 'delete',
    text: 'Delete'
  }
]

export default {
  name: 'v-todo-item',
  components: {
    VDropdown
  },
  data() {
    return {
      todoOptions
    }
  }
}
</script>

<template>
  <li class="flex py-[3px]">
    <button
      class="w-[18px] h-[18px] border border-gray-400 rounded-full mr-[8px] mt-[2px]"
    ></button>
    <div class="flex flex-col">
      <div class="flex">
        <p>some test todo title</p>
      </div>
      <div class="flex mt-[2px]">
        <v-dropdown :options="todoOptions">
          <template #trigger>
            <button class="text-[11px]">15 mar</button>
          </template>
        </v-dropdown>
      </div>
    </div>
  </li>
</template>
