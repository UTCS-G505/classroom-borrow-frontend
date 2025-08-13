<script setup>
    import {ref} from "vue";

    import BorrowReview from './BorrowReview.vue';
    import AnnouncementManagement from './Announcement.vue';
    
    import BlacklistPage from './BlacklistPage.vue';

    const links = [
        { label: '借用審核', id: 'borrow-review' },  
        { label: '公告管理', id: 'announcement' },      
        { label: '違規(黑名單)', id: 'blacklist-management' }              
    ]

    //預設頁面
    const page = ref('borrow-review');

    //點擊導覽列，切換頁面
    function changePage(id){
        page.value = id;
    }

</script>

<template>
    <div class="container">
        <!-- 側邊導覽列 -->
        <aside class="sidebar">
        <h2 class="sidebarTitle">管理員選單</h2>
        <ul>
            <li v-for="link in links" :key="link.id">
            <span
                :class="{ current: page.value === link.id }"
                @click="changePage(link.id)"
                class="navLink"
            >
                {{ link.label }}
            </span>
            </li>
        </ul>
        </aside>    
    
    

        <!-- 主內容區 -->
        <section class="content">
            <BorrowReview v-if="page === 'borrow-review'" />
            <AnnouncementManagement v-else-if="page === 'announcement'" />
            <BlacklistPage v-else-if="page === 'blacklist-management'" />
        </section>
    </div>

</template>

<style scoped>

    .container {
        display: flex;
        min-height: 100vh;
    }

    .sidebar {
        width: 200px;
        background-color: #5D5C61;
        color: #fff;
        padding: 1rem;
    }

    .sidebarTitle{
        font-size: 20px;
        margin-top: 30px;
        margin-bottom: 20px;
    }

    .sidebar ul{
        list-style: none;
        padding: 0;
    }

    .sidebar li{
        margin-bottom: 15px;
        cursor: pointer;
    }

    .navLink{
        text-decoration: none;
        color: #fff;
        display: block;
        padding: 8px;
        transition: background-color 0.3s;
    }

    .navLink:hover{
        background-color: #777;
    }

    .content {
        flex: 1; /* 自動撐滿剩下空間 */
        padding: 20px;
        background-color: #F6F6F5;
    }

</style>

<style>
    *{
        padding: 0;
        margin: 0;
    }
    body{
        background-color: #F6F6F5;
    }
</style>