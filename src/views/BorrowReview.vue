<script setup>
import {ref,computed} from "vue";

//申請資料(先用假資料，到時候要改成從借用畫面那邊傳過來)
const applications = ref([
    {
        applicant: "王XX",
        classroom: "G508",
        date: "2025/07/30",
        startTime: "12:00",
        endTime: "15:00",
        status: "審核中",
    },
    {
        applicant: "陳XX",
        classroom: "G516",
        date: "2025/07/31",
        startTime: "10:00",
        endTime: "12:00",
        status: "審核中",
    },
    {
        applicant: "張XX",
        classroom: "G316",
        date: "2025/08/10",
        startTime: "14:00",
        endTime: "15:00",
        status: "審核中",
    },
]);

//核准
function approve(index){
    applications.value[index].status = "已核准";
}

//加入黑名單
function blacklist(index){
    applications.value[index].status = "黑名單";
}

//動態計算統計數據
const stats = computed(()=>{
    const total = applications.value.length;
    const pending = applications.value.filter(item => item.status == "審核中").length;
    const approved = applications.value.filter(item => item.status == "已核准").length;
    return {total, pending, approved};
});

</script>

<template>
    <!-- 當日的借用統計 -->
    <section class="stats">
        <h3>今日借用統計</h3>
        <p>
            總借用：{{stats.total}} |
            審核中：{{stats.pending}} |
            已核准：{{stats.approved}}
        </p>
    </section>
</template>


<style scoped>
    .stats{
        background-color: #fff;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    .stats h3{
        margin-bottom: 15px;
    }
</style>