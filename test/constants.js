module.exports = {
    CLUB_1: {
        nom: "CSN GUYANCOURT",
        code: 1196
    },
    CLUB_2: {
        nom: "CNEPE",
        code: 512
    },
    NAGEUR_1: {
        nom: "DESCHAMP Fabrice",
        anneeNaissance: 71,
        nationalite: "FRA",
        codeClub: 1196,
        codeIuf: 1801793
    },
    MEETING_1: {
        lieu: "CHEVREUSE",
        nom: "20e Meeting de la Vallée",
        bassin: "25",
        date: "Du Vendredi 1er au Dimanche 3 Décembre 2017",
        code: 49551
    },
    EPREUVE_1: {
        meetingCode: 49551,
        epreuveCode: 52,
    },
    EPREUVE_1_COURSES: [
        { titre: "Séries   SENIORS : 18 ans et plus", date: "Samedi 2 Décembre 2017 - 17h04" },
        { titre: "Séries   JUNIORS : 15-17 ans", date: "Samedi 2 Décembre 2017 - 11h09" },
        { titre: "Séries   JEUNES : 12-14 ans", date: "Samedi 2 Décembre 2017 - 10h50" }
    ],
    COURSES_1_PERFORMANCES: [
        { codeNageur : 1725028, codeClub : 2633, temps : "00:50.78", points : 1232 }
    ],
    COURSES_2_PERFORMANCES_1: [
        { codeNageur : 1417122, codeClub : 576, temps : "00:53.74", points : 1130 }
    ],
    COURSES_2_PERFORMANCES_2: [
        { codeNageur : 1417122, codeClub : 576, temps : "00:53.74", points : 1130 },
        { codeNageur : 1679321, codeClub : 1156, temps : "00:59.65", points : 940 },
        { codeNageur : 1412728, codeClub : 1156, temps : "01:01.10", points : 896 },
    ],
    COURSES_3_PERFORMANCES_1: [
        { codeNageur : 2669929, codeClub : 1156, temps : "01:15.69", points : 513 }
    ],
    COURSES_3_PERFORMANCES_2: [
        { codeNageur : 1180826, codeClub : 576, temps : "00:57.55", points : 1006 },
        { codeNageur : 1259728, codeClub : 1156, temps : "00:57.66", points : 1002 },
        { codeNageur : 2669929, codeClub : 1156, temps : "01:15.69", points : 513 },
    ],
    MONGO_DB_URI: 'mongodb://localhost/myTestBase'
}