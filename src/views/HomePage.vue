<script setup>

    import { ref } from "vue";
    import { useRouter } from "vue-router";

    const link = ref([
        { 
            id: "seeClass", 
            name: "查看教室", 
            url: "/introduction" 
        },
        { 
            id: "startBorrow", 
            name: "立即借用", 
            url: "/borrow" 
        },
    ]);

    const rules = ref([
        { 
            id: "1", 
            content: "本系出借教室悉依據本校「場地設備收費標準及管理使用要點」(以下簡稱本校場地管理要點)辦理，可提供借用場地為 (1)G312會議室 (2)G313普通教室 (3)G314普通教室 (4)G325電腦教室 (5)G316電腦教室 (6)G501會議室 (7)G508系會議室 (8)G516電腦教室 (9)G506 IOS教室", 
            addition: ""
        },
        { 
            id: "2", 
            content: "本校教學單位、行政單位申請借用場地時依據本校「場地管理要點」第十點：「(十四)」本校單位免費使用場地...」，餘依規定辦理借用申請，並依「附表四」進行收費。", 
            addition: ""
        },
        { 
            id: "3", 
            content: "借用教室請於借用日期10天前至資訊科學系辦公室確認檔期並遞送借用申請表。", 
            addition: ""
        },
        { 
            id: "4", 
            content: "借用日期或時段如非周一至周五上課時段，須提前於上課時段至系辦借用教室鑰匙，並於次上課日上午8點錢將鑰匙歸還系辦", 
            addition: ""
        },
        { 
            id: "5", 
            content: "使用普通教室資訊設備請於使用完畢後確認所有設備電源關閉，並關妥電源、空調、擦拭黑/白板並帶走垃圾後將前、後門上鎖再行離開。", 
            addition: ""
        },
        { 
            id: "6", 
            content: "本系如有特殊需要收回場地自行使用，得於使用7日前通知原申請單位，申請單位不得有異議。", 
            addition: ""
        },
        { 
            id: "7", 
            content: "其他未盡事項悉依本校場地管理要點辦理，如有違反要點及注意事項則日後不予出借。", 
            addition: ""
        },
        { 
            id: "8", 
            content: "開始使用本系統視同同意以上事項。", 
            addition: ""
        },
    ]);



    function changePage(link)
    {
        router.push({
            path: {link},
            query: "/home"
        });
    }

    const router = useRouter();

    
</script>



<template>

    <section class="introduction">
        <h1>臺北市立大學 資訊科學系</h1>
        <h1>教室借用系統</h1>

        <!-- 按鈕 -->
        <div class="pageSwitchButton">
            <button
            v-for="btn in link"
            :key="btn.id"
            @click="changePage(btn.url)"
            >
                {{ btn.name }}
            </button>
        </div>
        
        
        <br></br>
        <h1>注意事項</h1>
        <hr>

        <!-- 規則 -->
        <div
            class="ruleIntro" 
            v-for="rule in rules" 
            :key="rule.id"
            :id="rule.id"  
            >

            <div class="ruleSentence">
                {{ rule.id }}.{{ rule.content }}<br>
            </div>

            <div class="ruleAddition">
                {{ rule.addition }}<br>
            </div>
        </div>

        <!-- 版權 -->

        <p>
            版權
        </p>

    </section>

</template>