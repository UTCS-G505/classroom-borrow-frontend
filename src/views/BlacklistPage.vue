<script setup>
const { blacklist } = defineProps({
  blacklist: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['deleteBlacklist'])
</script>

<template>
  <section class="list">
    <h3>黑名單列表</h3>
    <table v-if="blacklist.length">
      <thead>
        <tr>
          <th>申請人</th>
          <th>教室</th>
          <th>時間</th>
          <th>用途</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, index) in blacklist" :key="index">
          <td>{{ item.applicant }}</td>
          <td>{{ item.classroom }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.reason }}</td>
          <td>
            <button @click="emit('deleteBlacklist', index)">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>目前沒有黑名單資料</p>
  </section>
</template>

<style scoped>
.list {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #e6e6e6;
}

th,
td {
  border: solid 1px #ddd;
  padding: 8px;
  text-align: center;
}

button {
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background-color: #dcdddf;
  color: #666;
  cursor: pointer;
  margin-right: 5px;
}

@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
