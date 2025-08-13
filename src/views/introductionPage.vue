<script setup>
    import {ref} from "vue";
    import { useRouter } from "vue-router";

    // 可借用教室資料
    const classrooms = ref([
        { 
            id: "G312", 
            name: "G312 會議室", 
            location: "公誠樓 3 樓", 
            equipment: "白板、投影幕、桌椅", 
            description: "開會...",
            img: "/picture/G312.png",
            seatMap: "/downloads/G312-seatmap.pdf"  
        },
        { 
            id: "G313", 
            name: "G313 普通教室", 
            location: "公誠樓 3 樓", 
            equipment: "白板、投影幕、桌椅", 
            description: "可容納 60 人....。" ,
            img: "/picture/G313.png",
            seatMap: "/downloads/G313-seatmap.pdf"  
        },
        { 
            id: "G314", 
            name: "G314 普通教室", 
            location: "公誠樓 3 樓", 
            equipment: "白板、投影幕、桌椅", 
            description: "可容納 60 人....",
            img: "/picture/G314.png",
            seatMap: "/downloads/G314-seatmap.pdf"  
        },
        { 
            id: "G315", 
            name: "G315 電腦教室", 
            location: "公誠樓 3 樓", 
            equipment: "50 台電腦、白板、投影幕", 
            description: "可容納 50 人....",
            img: "/picture/G315.png",
            seatMap: "/downloads/G315-seatmap.pdf"  
        },
        { 
            id: "G316", 
            name: "G316 電腦教室", 
            location: "公誠樓 3 樓", 
            equipment: "50 台電腦、白板、投影幕", 
            description: "可容納 50 人....",
            img: "/picture/G316.png",
            seatMap: "/downloads/G316-seatmap.pdf"    
        },
        { 
            id: "G501", 
            name: "G501 會議室", 
            location: "公誠樓 5 樓", 
            equipment: "白板、投影幕、桌椅", 
            description: "開會...",
            img: "/picture/G501.png",
            seatMap: "/downloads/G501-seatmap.pdf"   
        },
        { 
            id: "G508", 
            name: "G508 系圖書室", 
            location: "公誠樓 5 樓", 
            equipment: "書架、閱覽桌椅", 
            description: "讀書、討論...",
            img: "/picture/G508.png",
            seatMap: "/downloads/G508-seatmap.pdf"  
        },
        { 
            id: "G509", 
            name: "G509 IOS教室", 
            location: "公誠樓 5 樓", 
            equipment: "Mac 電腦、白板、投影幕", 
            description: "可容納40人...",
            img: "/picture/G509.png",
            seatMap: "/downloads/G509-seatmap.pdf"   
        },
        { 
            id: "G516", 
            name: "G516 電腦教室", 
            location: "公誠樓 5 樓", 
            equipment: "50 台電腦、白板、投影幕", 
            description: "可容納 50 人....",
            img: "/picture/G516.png",
            seatMap: "/downloads/G516-seatmap.pdf"   
        },
    ]);

    //樓層平面圖資料
    const floorPlans = ref([
        {title:"三樓平面圖",img:"/picture/floor3.png"},
        {title:"五樓平面圖",img:"/picture/floor5.png"},
    ]);

    //點選按鈕，滑動到對應的教室介紹
    function scrollToRoom(id){
        const target = document.getElementById(id);
        if(target){
            target.scrollIntoView({behavior: "smooth"});
        }
    }

    const router = useRouter();
    function goToBorrowPage(){
        router.push("/borrow");
    }
    
</script>

<template>

    <section class="introduction">

        <h1>教室介紹</h1>
        <hr>
        <p>可提供借用教室為</p>

        <!-- 教室按鈕區塊 -->
        <div class="buttonGrid">
            <button
            v-for="room in classrooms"
            :key="room.id"
            @click="scrollToRoom(room.id)"
            >
                {{ room.name }}
            </button>
        </div>

        <!-- 樓層平面圖展示 -->
        <div class="floorPlans">
            <div class="plan" v-for="plan in floorPlans" :key="plan.title">
                <h3>{{ plan.title }}</h3>
                <img :src="plan.img" :alt="plan.title"/>
            </div>
        </div>

        <!--各教室介紹區塊-->
        <div
            class="classroomIntro" 
            v-for="room in classrooms" 
            :key="room.id"
            :id="room.id"  
            >

            <div class="classroomImage">
                <img :src="room.img" :alt="room.name">
            </div>

            <div class="classroomInfo">
                <h3>{{ room.name }}</h3>
                <p><strong>位置：</strong>{{ room.location }}</p>
                <p><strong>設備：</strong>{{room.equipment}}</p>
                <a :href="room.seatMap" download>下載教室座位表.pdf ⬇</a>
                <button class="borrowBtn" @click="goToBorrowPage">我要借用</button>
            </div>
        </div>

    </section>

</template>

<style scoped>
    .introduction {
        max-width: 1000px;
        margin: 40px auto;
        color: #666;
    }

    .introduction h1{
        font-size: 30px;
        margin-bottom: 20px;
    }

    .introduction p{
        font-size: 20px;
        margin-bottom: 25px;
    }

    .buttonGrid{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
    }

    button{
        background-color: #C2DDFF;
        border: none;
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 16px;
        color: #555;
        font-weight: 500;
        cursor: pointer;
    }

    button:hover{
        background-color: #A7C5EB;
    }

    .floorPlans{
        display: flex;
        flex-wrap: wrap;
        gap: 32px;
        justify-content: center;
        margin-top: 50px;
    }
    
    .plan{
        flex: 1 1 300px;
        max-width: 500px;
        height: auto;
        text-align: center;
    }

    .plan img{
        height: auto;
        width: 100%;
    }

    .classroomIntro{
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 40px;
        padding: 20px;
        margin-top: 30px;
        background-color: #eae8e6;
    }

    .classroomImage{
        flex: 2;
    }

    .classroomImage img{
        width: 100%;
        height: auto;
        max-height: 450px;
    }

    .classroomInfo {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .classroomInfo h3 {
        font-size: 30px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #444;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
    }

    .classroomInfo p {
        margin: 8px 0;
        color: #666;
        font-size: 16px;
    }

    .classroomInfo a {
        margin-top: 15px;
        color: #666;
        text-decoration: none;
    }

    .classroomInfo a:hover {
        text-decoration: underline;
    }

    .borrowBtn {
        margin-top: 30px;
        background-color: #d9d9d9;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 16px;
    }

    .borrowBtn:hover {
        background-color: #ccc;
    }

    @media (max-width: 767px){
        .buttonGrid{
            grid-template-columns: repeat(2, 1fr);
        }

        .classroomIntro{
            flex-direction: column;
            align-items: flex-start;
        }

        .classroomImage, .classroomInfo{
            width: 100%;
        }

        .classroomImage img{
            width: 100%;
        }
    }

</style>

