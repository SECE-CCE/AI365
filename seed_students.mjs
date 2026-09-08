import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL);

// ── Password Logic ─────────────────────────────────────────────────────────────
// Password = "sece@" + last 5 digits of phone  |  No phone => "sece@lateral"
function makePassword(phone) {
  if (!phone || String(phone).trim() === "") return "sece@lateral";
  const digits = String(phone).replace(/\D/g, "");
  const last5 = digits.slice(-5);
  return last5.length === 5 ? "sece@" + last5 : "sece@lateral";
}

// ── Data ───────────────────────────────────────────────────────────────────────
// Format: [rollNo, registerNumber, fullName, phone, email]

const students2nd = [
  ["25CC001","722825134001","Adhithya R",                    "9809808442","adhithya.r2025cce@sece.ac.in"],
  ["25CC002","722825134002","Arockia Sterin S",              "8098745039","arockiasterin.s2025cce@sece.ac.in"],
  ["25CC003","722825134003","Arthika M S",                   "6385426424","arthika.ms2025cce@sece.ac.in"],
  ["25CC004","722825134004","Devadharun R",                  "7708933737","devadharun.r2025cce@sece.ac.in"],
  ["25CC005","722825134005","Dharaneesh S",                  "9414936152","dharaneesh.s2025cce@sece.ac.in"],
  ["25CC006","722825134006","Dharun Sridharan S",            "9500493353","dharunsridharan.s2025cce@sece.ac.in"],
  ["25CC007","722825134007","Dhevinth M S",                  "9080491480","dhevinth.ms2025cce@sece.ac.in"],
  ["25CC008","722825134008","Ezhumalai M",                   "7810083128","ezhumalai.m2025cce@sece.ac.in"],
  ["25CC009","722825134009","Gokulraj D",                    "6380428762","gokulraj.d2025cce@sece.ac.in"],
  ["25CC010","722825134010","Gowtham K",                     "9789626703","gowtham.k2025cce@sece.ac.in"],
  ["25CC011","722825134011","Hari Prasanna R",               "9965999818","hariprasanna.r2025cce@sece.ac.in"],
  ["25CC012","722825134012","Haritha Cr",                    "7397683726","haritha.cr2025cce@sece.ac.in"],
  ["25CC013","722825134013","Harshetha D",                   "7845406522","harshetha.d2025cce@sece.ac.in"],
  ["25CC014","722825134014","Heyram P",                      "9677788343","heyram.p2025cce@sece.ac.in"],
  ["25CC015","722825134015","Hurshanth Sr",                  "8098065562","hurshanth.sr2025cce@sece.ac.in"],
  ["25CC016","722825134016","Janani P",                      "9786825252","janani.p2025cce@sece.ac.in"],
  ["25CC017","722825134017","Jasna M",                       "7200813469","jasna.m2025cce@sece.ac.in"],
  ["25CC018","722825134018","Jayaruba M",                    "9994248727","jayaruba.m2025cce@sece.ac.in"],
  ["25CC019","722825134019","Kamalesh R",                    "6369508042","kamalesh.r2025cce@sece.ac.in"],
  ["25CC020","722825134020","Kavindeebak M",                 "8056784624","kavindeebak.m2025cce@sece.ac.in"],
  ["25CC021","722825134021","Keerthivishal M",               "9080253010","keerthivishal.m2025cce@sece.ac.in"],
  ["25CC022","722825134022","Keshav J",                      "9894176647","keshav.j2025cce@sece.ac.in"],
  ["25CC023","722825134023","Kiruthika Ns",                  "8807843177","kiruthika.ns2025cce@sece.ac.in"],
  ["25CC024","722825134024","Kishwanth V U",                 "7708183176","kishwanth.vu2025cce@sece.ac.in"],
  ["25CC025","722825134025","Krishnakumar G",                "8072304453","krishnakumar.g2025cce@sece.ac.in"],
  ["25CC026","722825134026","Leellatharan R A",              "9344116530","leellatharan.ra2025cce@sece.ac.in"],
  ["25CC027","722825134027","Leka Adithyan G",               "9790706116","lekaadithyan.g2025cce@sece.ac.in"],
  ["25CC028","722825134028","Madesh M",                      "8489772012","madesh.m2025cce@sece.ac.in"],
  ["25CC029","722825134029","Manoranjan V",                  "9043568921","manoranjan.v2025cce@sece.ac.in"],
  ["25CC030","722825134030","Manushri S S",                  "9976045511","manushri.ss2025cce@sece.ac.in"],
  ["25CC031","722825134031","Mohammed Shajith B",            "8072411172","mohammedshajith.b2025cce@sece.ac.in"],
  ["25CC032","722825134032","Mothishya V",                   "7305314158","mothishya.v2025cce@sece.ac.in"],
  ["25CC033","722825134033","Navaneth S V",                  "9047345811","navaneth.sv2025cce@sece.ac.in"],
  ["25CC034","722825134034","Naveenkumar G",                 "7395841361","naveenkumar.g2025cce@sece.ac.in"],
  ["25CC035","722825134035","Nikita Sri M",                  "6380333929","nikitasri.m2025cce@sece.ac.in"],
  ["25CC036","722825134036","Oviya C",                       "9585689369","oviya.c2025cce@sece.ac.in"],
  ["25CC037","722825134037","Poonthalir K",                  "9787067339","poonthalir.k2025cce@sece.ac.in"],
  ["25CC038","722825134038","Praneetha S",                   "7305621166","praneetha.s2025cce@sece.ac.in"],
  ["25CC039","722825134039","Prithika V",                    "6382109820","prithika.v2025cce@sece.ac.in"],
  ["25CC040","722825134040","Priyanka M",                    "7397064543","priyanka.m2025cce@sece.ac.in"],
  ["25CC041","722825134041","Ranjani A",                     "9344263289","ranjani.a2025cce@sece.ac.in"],
  ["25CC042","722825134042","Raveena Shree V",               "6385712805","raveenashree.v2025cce@sece.ac.in"],
  ["25CC043","722825134043","Rupaadharan Sr",                "8122017299","rupaadharan.sr2025cce@sece.ac.in"],
  ["25CC044","722825134044","Samyuktha P",                   "7397030429","samyuktha.p2025cce@sece.ac.in"],
  ["25CC045","722825134045","A Sangeeth",                    "8637611485","asangeeth.2025cce@sece.ac.in"],
  ["25CC046","722825134046","Santhini E",                    "7539931401","santhini.e2025cce@sece.ac.in"],
  ["25CC047","722825134047","Sasikala S",                    "6369698985","sasikala.s2025cce@sece.ac.in"],
  ["25CC048","722825134048","Sathurvika R",                  "8825899610","sathurvika.r2025cce@sece.ac.in"],
  ["25CC049","722825134049","Selvapriya S",                  "9080911408","selvapriya.s2025cce@sece.ac.in"],
  ["25CC050","722825134050","Shafrin M",                     "9500881595","shafrin.m2025cce@sece.ac.in"],
  ["25CC051","722825134051","Shalini M",                     "9363414415","shalini.m2025cce@sece.ac.in"],
  ["25CC052","722825134052","Shri Vishnu R",                 "7397698802","shrivishnu.r2025cce@sece.ac.in"],
  ["25CC053","722825134053","Sowbakya T",                    "6381965108","sowbakya.t2025cce@sece.ac.in"],
  ["25CC054","722825134054","Sowbarnika P",                  "8220800405","sowbarnika.p2025cce@sece.ac.in"],
  ["25CC055","722825134055","Sri Aiswarya D",                "9787238803","sriaiswarya.d2025cce@sece.ac.in"],
  ["25CC056","722825134056","Sribhavan V",                   "7448400363","sribhavan.v2025cce@sece.ac.in"],
  ["25CC057","722825134057","Sudharsan A",                   "9962134464","sudharsan.a2025cce@sece.ac.in"],
  ["25CC058","722825134058","Sujith Manthira Moorthi K R",   "9384549339","sujithmanthiramoorthy.k2025cce@sece.ac.in"],
  ["25CC059","722825134059","Swathika R",                    "8807181606","swathika.r2025cce@sece.ac.in"],
  ["25CC060","722825134060","Thivya Sriee S M",              "9524450133","thivyasriee.sm2025cce@sece.ac.in"],
  ["25CC061","722825134061","Thiya R",                       "8248591707","thiya.r2025cce@sece.ac.in"],
  ["25CC062","722825134062","Vignesh M",                     "9080715055","vignesh.m2025cce@sece.ac.in"],
  ["25CC063","722825134301","Yoga Tharshini R K",            "7010202835","yogatharshini.rk2025cce@sece.ac.in"],
  // Lateral entry
  ["25CC301","722825134302","Harini N",                      "",           "harini.n2025lcce@sece.ac.in"],
  ["25CC302","722825134303","Kishore",                       "",           "kishore.s2025lcce@sece.ac.in"],
  ["25CC303","722825134304","Mohan Prasanth K",              "",           "mohanprasanth.k2025lcce@sece.ac.in"],
  ["25CC304","722825134305","Ragul S",                       "",           "ragul.s2025lcce@sece.ac.in"],
  ["25CC305","722825134306","Vashmitha S A",                 "",           "vashmitha.sa2025lcce@sece.ac.in"],
];

const students3rd = [
  ["24CC001","722824134001","Adithyan R",                    "9842265532","adithyan.r2024cce@sece.ac.in"],
  ["24CC002","722824134002","Aishwarya A",                   "6380287625","aishwarya.a2024cce@sece.ac.in"],
  ["24CC003","722824134003","Aishwarya S",                   "9345604915","aishwarya.s2024cce@sece.ac.in"],
  ["24CC004","722824134004","Akash Vivian S",                "8110002925","akashvivian.s2024cce@sece.ac.in"],
  ["24CC005","722824134005","Angelin Sharmell E",            "9080816704","angelinsharmell.e2024cce@sece.ac.in"],
  ["24CC006","722824134006","Ashwath Krishnaa P V",          "9360645456","ashwathkrishnaa.pv2024cce@sece.ac.in"],
  ["24CC007","722824134007","Bharath Kumar K",               "9344164779","bharathkumar.k2024cce@sece.ac.in"],
  ["24CC008","722824134008","Boopana M",                     "8148016372","boopana.m2024cce@sece.ac.in"],
  ["24CC009","722824134009","Darshan A R",                   "8807715828","darshan.ar2024cce@sece.ac.in"],
  ["24CC010","722824134010","Deepiga R S",                   "7812896197","deepiga.rs2024cce@sece.ac.in"],
  ["24CC011","722824134011","Deepthika B",                   "7824929263","deepthika.b2024cce@sece.ac.in"],
  ["24CC012","722824134012","Dharshini K",                   "8056630304","dharshini.k2024cce@sece.ac.in"],
  ["24CC013","722824134013","Dheepan Chakravarthi S",        "9994188618","dheepanchakravathi.s2024cce@sece.ac.in"],
  ["24CC014","722824134014","Dhevavarshana D K",             "6369738724","dhevavardhana.dk2024cce@sece.ac.in"],
  ["24CC015","722824134015","Dinesh S",                      "9342591558","dinesh.s2024cce@sece.ac.in"],
  ["24CC016","722824134016","Festo Erick Mapunda",           "8754958060","festoerickmapunda2024cce@sece.ac.in"],
  ["24CC017","722824134017","Gayathri Devi K",               "9865779903","gayathridevi.k2024cce@sece.ac.in"],
  ["24CC018","722824134018","Gokulnaath N",                  "8668115823","gokulnaath.n2024cce@sece.ac.in"],
  ["24CC019","722824134019","Harinarayan S",                 "7010678030","harinarayan.s2024cce@sece.ac.in"],
  ["24CC020","722824134020","Harini R",                      "8870245668","harini.r2024cce@sece.ac.in"],
  ["24CC021","722824134021","Harshitha V",                   "6383409429","harshitha.v2024cce@sece.ac.in"],
  ["24CC022","722824134022","Iniya C",                       "8838885300","iniya.c2024cce@sece.ac.in"],
  ["24CC023","722824134023","Jebarson E",                    "9342334787","jebarson.e2024cce@sece.ac.in"],
  ["24CC024","722824134024","Kabil Munishwar",               "6380612089","kabilmunishwar.2024cce@sece.ac.in"],
  ["24CC025","722824134025","Kavinilavu R",                  "9363622164","kavinilavu.r2024cce@sece.ac.in"],
  ["24CC026","722824134026","Kingstan J",                    "9342003360","kingstan.j2024cce@sece.ac.in"],
  ["24CC027","722824134027","Lathikashree S",                "9994874096","lathikashree.s2024cce@sece.ac.in"],
  ["24CC028","722824134028","Mathimozhi J",                  "9361334291","mathimozhi.j2024cce@sece.ac.in"],
  ["24CC029","722824134029","Mei Harish Gokul S",            "7871736516","meiharishgokul.s2024cce@sece.ac.in"],
  ["24CC030","722824134030","Mohamed Jeseem",                "9361096903","mohamedjeseem.2024cce@sece.ac.in"],
  ["24CC031","722824134031","Monika Sree D",                 "8438940506","monikasree.d2024cce@sece.ac.in"],
  ["24CC032","722824134032","Neha S",                        "9025307530","neha.s2024cce@sece.ac.in"],
  ["24CC033","722824134033","Nethra Harini K",               "6374505856","nethraharini.k2024cce@sece.ac.in"],
  ["24CC034","722824134034","Nithin M",                      "9487772210","nithin.m2024cce@sece.ac.in"],
  ["24CC035","722824134035","Nitin M",                       "9445574741","nitin.m2024cce@sece.ac.in"],
  ["24CC036","722824134036","Nivethini R V",                 "9894350010","nivethini.rv2024cce@sece.ac.in"],
  ["24CC037","722824134037","Pragathi S",                    "9080650953","pragathi.s2024cce@sece.ac.in"],
  ["24CC038","722824134038","Pranav A",                      "7845668546","pranav.a2024cce@sece.ac.in"],
  ["24CC039","722824134039","Pranaw Somesh R",               "7418709944","pranawsomesh.r2024cce@sece.ac.in"],
  ["24CC040","722824134040","Pratheksha S",                  "9843744878","pratheksha.s2024cce@sece.ac.in"],
  ["24CC041","722824134041","Priyadharshni S",               "6380362405","priyadharshini.s2024cce@sece.ac.in"],
  ["24CC042","722824134042","Priyanka T M",                  "9080469100","priyanka.tm2024cce@sece.ac.in"],
  ["24CC043","722824134043","Rithanya K",                    "7358821254","rithanya.k2024cce@sece.ac.in"],
  ["24CC044","722824134044","Sabarikarthika S",              "9003573415","sabarikarthika.s2024cce@sece.ac.in"],
  ["24CC045","722824134045","Sadhana V",                     "9345869382","sadhana.v2024cce@sece.ac.in"],
  ["24CC046","722824134046","Sakthi Kamalam G",              "9042032611","sakthikamalam.g2024cce@sece.ac.in"],
  ["24CC047","722824134047","Samvarthini T",                 "9629933495","samvarthini.t2024cce@sece.in"],
  ["24CC048","722824134048","Sarathi B",                     "9342528370","sarathi.b2024cce@sece.ac.in"],
  ["24CC049","722824134049","Sathurmitha S S",               "7904395270","sathurmitha.ss2024cce@sece.ac.in"],
  ["24CC050","722824134050","Shanthini P",                   "8526753012","shanthini.p2024cce@sece.ac.in"],
  ["24CC051","722824134051","Shruthilaya N S",               "8072924796","shruthilaya.ns2024cce@sece.ac.in"],
  ["24CC052","722824134052","Sri Vignesh S",                 "9566920232","srivignesh.s2024cce@sece.ac.in"],
  ["24CC053","722824134053","Srinithi S S",                  "7358811899","srinithi.ss2024cce@sece.ac.in"],
  ["24CC054","722824134054","Sudhir D",                      "8807657733","sudhir.d2024cce@sece.ac.in"],
  ["24CC055","722824134055","Sugirthan S",                   "9384986755","sugirthan.s2024cce@sece.ac.in"],
  ["24CC056","722824134056","Suruthi V",                     "9345896195","suruthi.v2024cce@sece.ac.in"],
  ["24CC057","722824134057","Swathi B K",                    "6381772232","swathi.bk2024cce@sece.ac.in"],
  ["24CC058","722824134058","Tanyasri G R",                  "9994282233","tanyasri.gr2024cce@sece.ac.in"],
  ["24CC059","722824134059","Varunkumar S N",                "9965778080","varunkumar.sn2024cce@sece.ac.in"],
  ["24CC060","722824134060","Vasantha Kumar M",              "9025457406","vasanthakumar.m2024cce@sece.ac.in"],
  ["24CC061","722824134061","Vishal S R",                    "9994258299","vishal.sr2024cce@sece.ac.in"],
  ["24CC062","722824134062","Viswesh Balaji V S",            "7708952580","visweshbalaji.vs2024cce@sece.ac.in"],
  ["24CC063","722824134063","Yohitha B",                     "9344052016","yohitha.b2024cce@sece.ac.in"],
  ["24CC064","722824134064","Yosica P",                      "9003207958","yosica.p2024cce@sece.ac.in"],
  // Lateral / special
  ["24CC501","722824134501","Dhatchan K R",                  "7418880171","dhatchan.kr2023cce@sece.ac.in"],
  ["24CC301","722824134301","Dhinesh Kumar S",               "7695851991","dhineshkumar.s2024lcce@sece.ac.in"],
];

const students4th = [
  ["23CC001","722823134001","Adhithya Veeramalai Manickam",  "8072563091","adhithyaveeramalaimanickam2023cce@sece.ac.in"],
  ["23CC002","722823134002","Ajiba Reeshma B",               "6385719891","ajibareeshma.b2023cce@sece.ac.in"],
  ["23CC003","722823134003","Arvind B",                      "8438417501","arvind.b2023cce@sece.ac.in"],
  ["23CC004","722823134004","Aswin E",                       "9842795095","aswin.e2023cce@sece.ac.in"],
  ["23CC005","722823134005","Chandru D",                     "9500744764","chandru.d2023cce@sece.ac.in"],
  ["23CC006","722823134006","Devananth S S",                 "6382178168","devananth.ss2023cce@sece.ac.in"],
  ["23CC007","722823134007","Devashree R",                   "8682832760","devashree.r2023cce@sece.ac.in"],
  ["23CC008","722823134008","Dhanavarshini P R",             "9791499819","dhanavarshini.pr2023cce@sece.ac.in"],
  ["23CC009","722823134009","Dharshana M",                   "9025152169","dharshana.m2023cce@sece.ac.in"],
  ["23CC010","722823134010","Dharun Adithya R",              "9487787974","dharunadithya.r2023cce@sece.ac.in"],
  ["23CC012","722823134012","Dhivyadharshini R",             "9788588092","dhiviyadharshini.r2023cce@sece.ac.in"],
  ["23CC013","722823134013","Dinesh Kumar I",                "9345643622","dineshkumar.i2023cce@sece.ac.in"],
  ["23CC014","722823134014","Gopi P",                        "9363166576","gopi.p2023cce@sece.ac.in"],
  ["23CC016","722823134016","Guruprasath M",                 "8870627998","guruprasath.m2023cce@sece.ac.in"],
  ["23CC017","722823134017","Harini C",                      "9943083826","harini.c2023cce@sece.ac.in"],
  ["23CC018","722823134018","Jaishree Y",                    "9361280237","jaishree.y2023cce@sece.ac.in"],
  ["23CC019","722823134019","Jason Joshuva J",               "9003407379","jasonjoshuva.j2023cce@sece.ac.in"],
  ["23CC020","722823134020","Jeiya Shivani S S",             "9843990499","jeiyashivani.ss2023cce@sece.ac.in"],
  ["23CC021","722823134021","Jeyanthi A",                    "9629382411","jeyanthi.a2023cce@sece.ac.in"],
  ["23CC022","722823134022","Jodhikrishnaa P",               "6385374709","jodhikrishnaa.p2023cce@sece.ac.in"],
  ["23CC023","722823134023","Kalaidharshini K",              "9042406930","kalaidharshini.k2023cce@sece.ac.in"],
  ["23CC024","722823134024","Karpagayalini R",               "7373603603","karpagayalini.r2023cce@sece.ac.in"],
  ["23CC025","722823134025","Kavika S",                      "6381553457","kavika.s2023cce@sece.ac.in"],
  ["23CC026","722823134026","Kavinesh E",                    "9360817465","kavinesh.e2023cce@sece.ac.in"],
  ["23CC027","722823134027","Kaviyarasu M",                  "9677513639","kaviyarasu.m2023cce@sece.ac.in"],
  ["23CC028","722823134028","Kawin M",                       "8807304048","kawin.m2023cce@sece.ac.in"],
  ["23CC029","722823134029","Keerthana R",                   "6385169748","keerthana.r2023cce@sece.ac.in"],
  ["23CC030","722823134030","Keerthana S",                   "9080036845","keerthana.s2023cce@sece.ac.in"],
  ["23CC031","722823134031","Kishore T",                     "6369941808","kishore.t2023cce@sece.ac.in"],
  ["23CC032","722823134032","Lavanya V",                     "9342201049","lavanya.v2023cce@sece.ac.in"],
  ["23CC033","722823134033","Madhesh Kanna A",               "9677348421","madheshkanna.a2023cce@sece.ac.in"],
  ["23CC034","722823134034","Mugesh G",                      "6380809090","mugesh.g2023cce@sece.ac.in"],
  ["23CC035","722823134035","Muralidharan S",                "8270640316","muralidharan.s2023cce@sece.ac.in"],
  ["23CC036","722823134036","Naveen R",                      "9095930717","naveen.r2023cce@sece.ac.in"],
  ["23CC037","722823134037","Naveen Raj R",                  "8148316014","naveenraj.r2023cce@sece.ac.in"],
  ["23CC038","722823134038","Nikhila D",                     "9789124752","nikhila.d2023cce@sece.ac.in"],
  ["23CC039","722823134039","Nirmal Raaju M B",              "6384316892","nirmalraaju.mb2023cce@sece.ac.in"],
  ["23CC040","722823134040","Pavithra E",                    "99345710286","pavithra.e2023cce@sece.ac.in"],
  ["23CC041","722823134041","Pradeepa M",                    "6380121932","pradeepa.m2023cce@sece.ac.in"],
  ["23CC042","722823134042","Prasanth M",                    "9894510975","prasanth.m2023cce@sece.ac.in"],
  ["23CC043","722823134043","Prisha S",                      "7598653900","prisha.s2023cce@sece.ac.in"],
  ["23CC044","722823134044","Samuvel Gipson S",              "9626749002","samuvelgipson.s2023cce@sece.ac.in"],
  ["23CC045","722823134045","Sanjay M",                      "9585317574","sanjay.m2023cce@sece.ac.in"],
  ["23CC046","722823134046","Sanjith S",                     "9894755053","sanjithsece@gmail.com"],
  ["23CC047","722823134047","Sarathi U",                     "7010766304","sarathi.u2023cce@sece.ac.in"],
  ["23CC048","722823134048","Saumya M",                      "9489675186","saumya.m2023cce@sece.ac.in"],
  ["23CC050","722823134050","Shobiha S",                     "7200908022","shobiha.s2023cce@sece.ac.in"],
  ["23CC051","722823134051","Shubha Gita K",                 "6374846400","shubhagita.k2023cce@sece.ac.in"],
  ["23CC052","722823134052","Sridhar N",                     "9597760309","sridhar.n2023cce@sece.ac.in"],
  ["23CC053","722823134053","Sriram K V",                    "6383091664","sriram.kv2023cce@sece.ac.in"],
  ["23CC054","722823134054","Srivignesh S",                  "8608633110","srivignesh.s2023cce@sece.ac.in"],
  ["23CC055","722823134055","Subhiksha R",                   "9342757732","subhikshar2023cce@sece.ac.in"],
  ["23CC056","722823134056","Sugan Prabhu G",                "7397108517","suganprabhu.g2023cce@sece.ac.in"],
  ["23CC057","722823134057","Surendar R",                    "7010559510","surendar.r2023cce@sece.ac.in"],
  ["23CC058","722823134058","Thamarai Selvan S",             "9042963306","thamaraiselvan.s2023cce@sece.ac.in"],
  ["23CC059","722823134059","Vainavi S",                     "9344140919","vainavi.s2023cce@sece.ac.in"],
  ["23CC060","722823134060","Varun S",                       "8838192429","varun.s2023cce@sece.ac.in"],
  ["23CC061","722823134061","Vishwa N",                      "6382720381","vishwa.n2023cce@sece.ac.in"],
  ["23CC062","722823134062","Yaswanth B",                    "9514751105","yaswanth.b2023cce@sece.ac.in"],
  ["23CC063","722823134063","Yuvaraj N",                     "8883369683","yuvaraj.n2023cce@sece.ac.in"],
];

// ── Step 1: Clear ALL existing students (admin/faculty kept safe) ──────────────
console.log("🗑️  Clearing all existing student records...");
const existing = await sql`SELECT id FROM users WHERE role = 'student'`;
const ids = existing.map(r => r.id);
if (ids.length > 0) {
  await sql`DELETE FROM auth_audit_logs         WHERE user_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM auth_logs               WHERE user_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM activity_logs           WHERE user_id = ANY(${ids}) OR target_student_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM notifications           WHERE user_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM event_registrations     WHERE student_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM student_usage_sessions  WHERE student_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM learning_hours          WHERE student_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM certificates            WHERE student_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM research_papers         WHERE student_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM projects                WHERE student_id = ANY(${ids})`.catch(() => {});
  await sql`DELETE FROM users                   WHERE id = ANY(${ids})`;
  console.log(`   ✅ Deleted ${ids.length} existing students and all related data.\n`);
} else {
  console.log("   ℹ️  No existing students found.\n");
}

// ── Step 2: Insert students ────────────────────────────────────────────────────
const DEPT = "Computer & Communication Engineering";
let ok = 0, fail = 0;

async function insertBatch(list, year) {
  for (const [rollNo, registerNumber, fullName, phone, email] of list) {
    try {
      const pwd  = makePassword(phone);
      const hash = await bcrypt.hash(pwd, 10);
      const ph   = phone && phone.trim() ? phone.trim() : null;

      await sql`
        INSERT INTO users
          (full_name, email, password, role, department,
           register_number, year, phone,
           profile_photo, status, must_change_password, is_department_wide)
        VALUES
          (${fullName}, ${email.toLowerCase()}, ${hash}, 'student', ${DEPT},
           ${registerNumber}, ${year}, ${ph},
           '/boy-avatar.svg', 'approved', true, false)
        ON CONFLICT (email) DO UPDATE SET
          full_name       = EXCLUDED.full_name,
          password        = EXCLUDED.password,
          register_number = EXCLUDED.register_number,
          year            = EXCLUDED.year,
          phone           = EXCLUDED.phone,
          status          = EXCLUDED.status
      `;

      process.stdout.write(
        `  ✅ [${year}] ${rollNo}  ${fullName.padEnd(40)} email=${email.toLowerCase()}  pwd=${pwd}\n`
      );
      ok++;
    } catch (e) {
      process.stdout.write(
        `  ❌ [${year}] ${rollNo}  ${fullName} => ${e.message}\n`
      );
      fail++;
    }
  }
}

console.log(`=== Inserting 2nd Year (${students2nd.length} students) ===`);
await insertBatch(students2nd, "2nd Year");

console.log(`\n=== Inserting 3rd Year (${students3rd.length} students) ===`);
await insertBatch(students3rd, "3rd Year");

console.log(`\n=== Inserting 4th Year (${students4th.length} students) ===`);
await insertBatch(students4th, "4th Year");

// ── Step 3: Summary ────────────────────────────────────────────────────────────
const byYear = await sql`
  SELECT year, COUNT(*) as cnt
  FROM users WHERE role = 'student'
  GROUP BY year ORDER BY year
`;

console.log("\n" + "=".repeat(70));
console.log("SEEDING COMPLETE");
console.log(`  Inserted: ${ok}   Failed: ${fail}`);
console.log("-".repeat(70));
byYear.forEach(r => console.log(`  ${(r.year || "Unknown").padEnd(12)}: ${r.cnt} students`));
const grand = byYear.reduce((s, r) => s + Number(r.cnt), 0);
console.log("-".repeat(70));
console.log(`  TOTAL: ${grand} students in NeonDB`);
console.log("=".repeat(70));
console.log("\n📌 Password Format:");
console.log("   Phone available    →  sece@<last5digits>   e.g. 9809808442 → sece@08442");
console.log("   No phone (lateral) →  sece@lateral");
