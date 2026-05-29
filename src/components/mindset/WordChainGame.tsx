import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Volume2, VolumeX, Trophy, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameAudio } from "@/hooks/useGameAudio";
import GameCountdown from "./GameCountdown";
import { useAuth } from "@/hooks/useAuth";
import { useWordChainScores } from "@/hooks/useWordChainScores";
import { GameLeaderboard } from "./GameLeaderboard";
import { GameAudioControls } from "./GameAudioControls";

// ═══════════════════════════════════════════════════════════════
// WORDSMITH — INFINITE WORD CHAIN. PROGRESSIVE DIFFICULTY.
// Type words that start with the last letter of the previous word.
// Timer shrinks, minimum word length grows. UNBREAKABLE · 2026
// ═══════════════════════════════════════════════════════════════

const STAGES = [
  { threshold: 0, name: "WARM UP", label: "STAGE 1", time: 15, minLen: 3 },
  { threshold: 5, name: "MOVING", label: "STAGE 2", time: 13, minLen: 3 },
  { threshold: 12, name: "SHARPER", label: "STAGE 3", time: 11, minLen: 4 },
  { threshold: 20, name: "LOCKED IN", label: "STAGE 4", time: 9, minLen: 4 },
  { threshold: 30, name: "ON FIRE", label: "STAGE 5", time: 8, minLen: 5 },
  { threshold: 45, name: "UNTOUCHABLE", label: "STAGE 6", time: 7, minLen: 5 },
  { threshold: 65, name: "GODSPEED", label: "STAGE 7", time: 6, minLen: 5 },
  { threshold: 90, name: "IMMORTAL", label: "STAGE 8", time: 5, minLen: 6 },
];

const getStage = (count: number) => {
  let s = STAGES[0];
  for (const st of STAGES) if (count >= st.threshold) s = st;
  return s;
};

// Comprehensive word list — common English words for validation
// We use a large set but validate client-side for instant feedback
const VALID_WORDS = new Set<string>();

// Load a basic dictionary of common words
const WORD_LIST = [
  // 3-letter
  "ace","act","add","age","ago","aid","aim","air","all","and","ant","any","ape","arc","are","ark","arm","art","ask","ate",
  "bad","bag","ban","bar","bat","bay","bed","bet","big","bit","bow","box","boy","bud","bug","bus","but","buy",
  "cab","can","cap","car","cat","cop","cow","cry","cub","cup","cut",
  "dad","dam","day","den","dew","did","dig","dim","dip","dog","dot","dry","dub","dud","due","dug","dun","duo","dye",
  "ear","eat","egg","elm","end","era","eve","ewe","eye",
  "fad","fan","far","fat","fax","fed","fee","few","fig","fin","fir","fit","fix","fly","foe","fog","for","fox","fry","fun","fur",
  "gab","gag","gal","gap","gas","gay","gel","gem","get","gig","gin","gnu","god","got","gum","gun","gut","guy","gym",
  "had","ham","has","hat","hay","hen","her","hew","hid","him","hip","his","hit","hob","hog","hop","hot","how","hub","hue","hug","hum","hut",
  "ice","icy","ill","imp","ink","inn","ion","ire","irk","its","ivy",
  "jab","jag","jam","jar","jaw","jay","jet","jig","job","jog","jot","joy","jug","jut",
  "keg","ken","key","kid","kin","kit",
  "lab","lad","lag","lap","law","lay","lea","led","leg","let","lid","lie","lip","lit","log","lot","low","lug",
  "mad","man","map","mar","mat","maw","may","men","met","mid","mix","mob","mod","mop","mow","mud","mug","mum","mun",
  "nab","nag","nap","net","new","nil","nip","nit","nod","nor","not","now","nub","nun","nut",
  "oak","oar","oat","odd","ode","off","oft","oil","old","one","opt","orb","ore","our","out","owe","owl","own",
  "pad","pal","pan","pap","par","pat","paw","pay","pea","peg","pen","pep","per","pet","pew","pie","pig","pin","pit","ply","pod","pop","pot","pow","pro","pry","pub","pug","pun","pup","pus","put",
  "rag","ram","ran","rap","rat","raw","ray","red","ref","rep","rib","rid","rig","rim","rip","rob","rod","roe","rot","row","rub","rug","rum","run","rut","rye",
  "sac","sad","sag","sap","sat","saw","say","sea","set","sew","she","shy","sin","sip","sir","sis","sit","six","ski","sky","sly","sob","sod","son","sop","sot","sow","soy","spa","spy","sty","sub","sue","sum","sun","sup",
  "tab","tad","tag","tan","tap","tar","tat","tax","tea","ten","the","thy","tic","tie","tin","tip","toe","ton","too","top","tow","toy","try","tub","tug","tun","two",
  "ugh","ump","urn","use",
  "van","vat","vet","vex","via","vie","vim","vow",
  "wad","wag","war","was","wax","way","web","wed","wet","who","why","wig","win","wit","woe","wok","won","woo","wop","wow",
  "yak","yam","yap","yaw","yea","yes","yet","yew","you","yow",
  "zap","zed","zen","zig","zip","zoo",
  // 4-letter
  "able","acid","aged","also","area","army","away","baby","back","ball","band","bank","bare","barn","base","bath","beam","bean","bear","beat","been","beer","bell","belt","bend","best",
  "bike","bill","bind","bird","bite","blow","blue","blur","boat","body","bold","bolt","bomb","bond","bone","book","boom","boot","bore","born","boss","both","bowl","bulk","bull","bump",
  "burn","bury","bush","busy","cafe","cage","cake","call","calm","came","camp","cape","card","care","cart","case","cash","cast","cave","cell","chat","chip","chop","cite","city","clad",
  "clam","clap","claw","clay","clip","club","clue","coal","coat","code","coil","coin","cold","come","cook","cool","cope","copy","cord","core","cork","corn","cost","cozy","crew","crop",
  "crow","cure","curl","cute","damp","dare","dark","dart","dash","data","date","dawn","dead","deaf","deal","dear","debt","deck","deed","deem","deep","deer","demo","deny","desk","dial",
  "dice","diet","dine","dire","dirt","disc","dish","dock","does","dome","done","door","dose","dove","down","drag","draw","drew","drip","drop","drum","dual","duck","duel","duke","dull",
  "dumb","dump","dune","dunk","dusk","dust","duty","dyed","each","earn","ease","east","easy","edge","edit","else","emit","epic","even","ever","evil","exam","exit","expo","face","fact",
  "fade","fail","fair","fake","fall","fame","fang","fare","farm","fast","fate","fear","feat","feed","feel","feet","fell","felt","file","fill","film","find","fine","fire","firm","fish",
  "fist","five","flag","flat","flaw","fled","flew","flip","flog","flow","flux","foam","fold","folk","font","food","fool","foot","ford","fore","fork","form","fort","foul","four","free",
  "from","fuel","full","fund","fury","fuse","fuss","fuzz","gain","gale","game","gang","gape","garb","gave","gaze","gear","gene","gift","girl","give","glad","glow","glue","goat","goes",
  "gold","golf","gone","good","grab","gram","gray","grew","grid","grim","grin","grip","grit","grow","gulf","guru","gust","hack","hail","hair","half","hall","halt","hand","hang","hard",
  "hare","harm","harp","hash","hate","haul","have","haze","hazy","head","heal","heap","hear","heat","heel","held","hell","helm","help","herb","herd","here","hero","hide","high","hike",
  "hill","hind","hint","hire","hold","hole","holy","home","hood","hook","hope","horn","hose","host","hour","howl","huge","hull","hump","hung","hunt","hurl","hurt","hush","hymn","icon",
  "idea","inch","into","iron","isle","item","jack","jade","jail","jazz","jean","jerk","jest","jolt","jump","june","jury","just","keen","keep","kept","kick","kill","kind","king","kiss",
  "kite","knee","knew","knit","knob","knot","know","lace","lack","laid","lake","lamb","lame","lamp","land","lane","lard","last","late","lawn","lazy","lead","leaf","leak","lean","leap",
  "left","lend","lens","less","liar","lick","life","lift","like","limb","lime","limp","line","link","lion","list","live","load","loan","lock","loft","logo","long","look","loop","lord",
  "lore","lose","loss","lost","loud","love","luck","lump","lung","lure","lurk","lush","made","maid","mail","main","make","male","mall","malt","mane","many","mare","mark","mash","mask",
  "mass","mast","mate","maze","meal","mean","meat","meet","meld","melt","memo","mend","menu","mere","mesh","mess","mile","milk","mill","mind","mine","mint","mire","miss","mist","moan",
  "moat","mock","mode","mold","monk","mood","moon","more","morn","moss","most","moth","move","much","mule","muse","mush","must","mute","myth","nail","name","nave","navy","near","neat",
  "neck","need","nest","news","next","nice","nine","node","none","norm","nose","note","noun","nude","null","numb","oath","obey","odds","odor","once","only","onto","open","oral","oven",
  "over","owed","pace","pack","page","paid","pail","pain","pair","pale","palm","pane","pang","park","part","pass","past","path","pave","peak","peal","pear","peat","peek","peel","peer",
  "pest","pick","pier","pike","pile","pine","pink","pipe","plan","play","plea","plot","plow","plug","plum","plus","poem","poet","poke","pole","poll","polo","pond","pool","poor","pope",
  "pore","pork","port","pose","post","pour","pray","prey","prop","pull","pulp","pump","punk","pure","push","quit","quiz","race","rack","rage","raid","rail","rain","rake","ramp","rang",
  "rank","rare","rash","rate","rave","read","real","reap","rear","reef","reel","rein","rely","rent","rest","rice","rich","ride","rift","ring","riot","rise","risk","road","roam","roar",
  "robe","rock","rode","role","roll","roof","room","root","rope","rose","ruin","rule","rung","rush","rust","sack","safe","sage","said","sail","sake","sale","salt","same","sand","sane",
  "sang","sank","save","scan","seal","seam","seat","sect","seed","seek","seem","seen","self","sell","send","sent","sept","shed","shin","ship","shoe","shop","shot","show","shut","sick",
  "side","sift","sigh","sign","silk","sink","site","size","skip","slab","slam","slap","slid","slim","slip","slit","slot","slow","slug","snap","snip","snow","soak","soap","soar","sock",
  "sofa","soft","soil","sold","sole","some","song","soon","sore","sort","soul","sour","span","spar","spec","sped","spin","spit","spot","star","stay","stem","step","stew","stir","stop",
  "such","suit","sulk","sure","surf","swan","swap","swim","sync","tack","tact","tail","take","tale","talk","tall","tame","tank","tape","task","taxi","teal","team","tear","teem","tell",
  "tend","tent","term","test","text","than","that","them","then","they","thin","this","thus","tick","tide","tidy","tied","tier","tile","till","tilt","time","tiny","tire","toad","toed",
  "toil","told","toll","tomb","tone","took","tool","tops","tore","torn","toss","tour","town","trap","tray","tree","trek","trim","trio","trip","trod","true","tube","tuck","tuna","tune",
  "turf","turn","twin","type","ugly","undo","unit","unto","upon","urge","used","user","vain","vale","vane","vary","vase","vast","veil","vein","vent","verb","very","vest","veto","vice",
  "view","vine","void","volt","vote","wade","wage","wait","wake","walk","wall","wand","want","ward","warm","warn","warp","wart","wary","wash","vast","wave","wavy","waxy","weak","wean",
  "wear","weed","week","weep","weld","well","went","were","west","what","when","whim","whip","whom","wick","wide","wife","wild","will","wilt","wily","wind","wine","wing","wink","wipe",
  "wire","wise","wish","wisp","with","woke","wold","wolf","womb","wood","wool","word","wore","work","worm","worn","wove","wrap","wren","year","yell","yoga","yoke","your","zeal","zero","zinc","zone","zoom",
  // 5+ letter common words
  "about","above","abuse","actor","adapt","admit","adopt","adult","after","again","agent","agree","ahead","alarm","album","alien","align","alive","alley","allow","alone","along","alter",
  "angel","anger","angle","angry","ankle","annex","apart","apple","apply","arena","argue","arise","armor","arose","array","arrow","aside","asset","atlas","audio","audit","avoid","awake",
  "award","aware","awful","badge","baker","basin","basis","batch","beach","beard","beast","began","begin","being","bench","berry","bible","birth","black","blade","blame","bland","blank",
  "blast","blaze","bleed","blend","bless","blind","blink","bliss","block","blond","blood","bloom","blown","board","boast","bonus","boost","bound","brain","brand","brave","bread","break",
  "breed","brick","bride","brief","bring","broad","broke","brook","brown","brush","buddy","build","built","bunch","burst","buyer","cabin","cable","candy","cargo","carry","catch","cause",
  "cease","chain","chair","chaos","charm","chart","chase","cheap","check","cheek","cheer","chess","chest","chief","child","chill","chose","chunk","civic","civil","claim","clash","class",
  "clean","clear","clerk","click","cliff","climb","cling","clock","clone","close","cloth","cloud","coach","coast","color","comic","coral","count","could","couch","tough","court","cover",
  "crack","craft","crane","crash","crazy","cream","creek","crime","crisp","cross","crowd","crown","crude","cruel","crush","curve","cycle","daily","dance","dated","death","debut","decay",
  "delay","delta","dense","depot","depth","derby","devil","diary","dirty","donor","doubt","dough","dozen","draft","drain","drama","drank","drape","drawn","dread","dream","dress","dried",
  "drift","drill","drink","drive","drove","drugs","drunk","dying","eager","early","earth","eight","elect","elite","email","empty","enemy","enjoy","enter","entry","equal","equip","error",
  "essay","event","every","exact","exert","exist","extra","faint","faith","false","fancy","fatal","fatty","fault","feast","fence","ferry","fetch","fever","fiber","field","fifth","fifty",
  "fight","final","first","fixed","flame","flash","flesh","fleet","float","flood","floor","flour","fluid","flush","fly","focus","folly","force","forge","forth","forum","found","frame",
  "frank","fraud","fresh","front","froze","fruit","fully","funny","giant","given","ghost","glass","gleam","globe","gloom","glory","gloss","glove","going","grace","grade","grain","grand",
  "grant","grape","graph","grasp","grass","grave","great","greed","green","greet","grief","grill","grind","groan","groom","gross","group","grove","grown","guard","guess","guest","guide",
  "guilt","happy","harsh","haven","heart","heavy","hence","herbs","hobby","honor","horse","hotel","house","human","humor","hurry","ideal","image","imply","index","indie","inner","input",
  "irony","issue","ivory","jewel","joint","jolly","judge","juice","juicy","karma","knife","knock","known","label","labor","large","laser","later","laugh","layer","learn","least","leave",
  "legal","level","light","limit","linen","lived","liver","lobby","local","logic","login","loose","lorry","lover","lower","loyal","lucky","lunch","lyric","magic","major","maker","manor",
  "maple","march","marry","match","mayor","meant","media","mercy","merit","metal","meter","might","minor","minus","model","money","month","moral","mount","mouse","mouth","moved","movie",
  "music","naked","nerve","never","night","noble","noise","north","noted","novel","nurse","occur","ocean","offer","often","olive","onset","opera","orbit","order","organ","other","ought",
  "outer","owner","oxide","pagan","paint","panel","panic","paper","party","paste","patch","pause","peace","peach","pearl","penny","phase","phone","photo","piano","piece","pilot","pinch",
  "pitch","pixel","pizza","place","plain","plane","plant","plate","plead","pleat","plaza","point","polar","porch","posed","pound","power","press","price","pride","prime","print","prior",
  "prize","probe","prone","proof","proud","prove","psalm","pulse","punch","pupil","quest","queen","query","queue","quick","quiet","quota","quote","radar","radio","raise","rally","ranch",
  "range","rapid","ratio","reach","react","ready","realm","rebel","refer","reign","relax","relay","renal","renew","repay","reply","rider","ridge","rifle","rigid","risky","rival","river",
  "robin","robot","rocky","roman","roost","rough","round","route","royal","ruler","rural","saint","salad","sauce","scale","scare","scene","scent","scope","score","scout","scrap","serve",
  "setup","seven","shade","shaft","shake","shall","shame","shape","share","shark","sharp","shave","shear","sheep","sheer","sheet","shelf","shell","shift","shine","shirt","shock","shore",
  "short","shout","shown","shrub","sight","silly","since","sixth","sixty","sized","skill","skull","slash","slate","slave","sleep","slice","slide","slope","small","smart","smell","smile",
  "smoke","snake","solar","solid","solve","sorry","sound","south","space","spare","spark","speak","speed","spell","spend","spent","spice","spine","spite","split","spoke","sport","spray",
  "squad","stack","staff","stage","stain","stair","stake","stale","stall","stamp","stand","stare","stark","start","state","stave","stays","steal","steam","steel","steep","steer","stern",
  "stick","stiff","still","stock","stole","stone","stood","stool","store","storm","story","stout","stove","strap","straw","stray","strip","stuck","study","stuff","stump","style","sugar",
  "suite","sunny","super","surge","swamp","swear","sweep","sweet","swept","swift","swing","swirl","sworn","swung","table","taste","teach","teeth","tempo","thank","theme","thick","thing",
  "think","third","those","three","threw","throw","thumb","tiger","tight","title","toast","today","token","tooth","torch","total","touch","tough","towel","tower","toxic","trace","track",
  "trade","trail","train","trait","trash","treat","trend","trial","tribe","trick","tried","troop","truck","truly","trump","trunk","trust","truth","tumor","twist","tying","ultra","uncle",
  "under","union","unite","unity","until","upper","upset","urban","usage","usual","utter","valid","value","valve","vapor","vault","venue","verse","video","vigor","vinyl","viral","virus",
  "visit","vista","vital","vivid","vocal","vodka","voice","voter","waist","waste","watch","water","weary","weave","wedge","weird","whale","wheat","wheel","where","which","while","white",
  "whole","whose","wider","widow","width","woman","world","worry","worse","worst","worth","would","wound","wrath","write","wrong","wrote","yacht","yield","young","youth","first",
  // 6+ letter
  "absorb","accept","access","across","acting","action","active","actual","advent","advice","advise","affair","affect","afford","agreed","almost","amount","animal","annual","answer",
  "anyone","appeal","appear","around","artist","assume","attack","attend","august","author","backed","ballot","battle","became","become","before","behalf","behind","belong","beside",
  "beyond","bishop","border","bottom","bounce","branch","breath","bridge","bright","broken","bronze","budget","burden","bureau","burned","butter","buying","called","cancer","carbon",
  "career","castle","caught","caused","center","chance","change","charge","chosen","church","circle","client","closed","closer","coffee","colony","column","combat","coming","commit",
  "common","comply","corner","costly","cotton","county","couple","course","cousin","create","credit","crisis","custom","damage","danger","deadly","dealer","debate","decade","decide",
  "defeat","defend","define","degree","demand","denial","deploy","deputy","desert","design","desire","detail","detect","device","devote","diesel","differ","dinner","direct","double",
  "dozens","driven","driver","during","easily","eating","editor","effect","effort","eighth","either","emerge","empire","employ","enable","ending","energy","engage","engine","enjoy",
  "enough","ensure","entire","entity","equity","escape","estate","ethnic","evolve","exceed","except","excuse","expand","expect","expert","export","extent","fabric","facing","factor",
  "failed","fairly","fallen","family","famous","farmer","faster","father","favour","female","figure","filing","finger","finish","fiscal","flavor","flying","follow","forced","forest",
  "forget","formal","format","formed","former","foster","fought","fourth","freeze","french","friend","frozen","frozen","galaxy","garden","gather","gender","gentle","german","global",
  "golden","govern","ground","growth","guitar","guilty","handle","happen","hardly","health","heaven","height","hidden","holder","honest","hoping","horror","hungry","hunter","ignore",
  "impact","import","impose","income","indeed","Indian","indoor","inform","injury","insect","inside","insist","intact","intend","intent","invest","island","itself","jersey","jungle",
  "junior","keeper","kidney","killer","lawyer","layout","leader","league","legacy","length","lesson","letter","lifted","linked","liquid","listen","little","lively","living","launch",
  "mainly","making","manage","manner","marine","marker","market","master","matter","medium","member","memory","mental","merely","merger","method","middle","mighty","miller","minute",
  "mirror","mobile","modern","modest","moment","mostly","mother","motion","murder","muscle","museum","mutual","myself","namely","narrow","nation","native","nature","nearly","needle",
  "neural","nobody","normal","notice","notion","number","object","obtain","occupy","offend","office","offset","oldest","online","oppose","option","orange","orient","origin","output",
  "palace","parent","parish","partly","patent","patrol","patron","paying","pencil","people","period","permit","person","phrase","picked","pillar","planet","player","please","plenty",
  "pocket","poetry","poison","police","policy","polite","poorly","prayer","prefer","prince","prison","profit","prompt","proper","proven","public","pursue","puzzle","racial","random",
  "rarely","rather","rating","reader","reason","recall","recent","record","reduce","reform","regard","regime","region","reject","relate","relief","remain","remedy","remote","remove",
  "render","rental","repeat","report","rescue","resign","resist","resort","result","retail","retain","retire","return","reveal","review","revolt","rhythm","riding","rising","robust",
  "rocket","rotate","ruling","runner","sacred","safely","salary","sample","saving","saying","scared","scheme","school","screen","search","season","second","secret","sector","secure",
  "seeing","select","seller","senior","series","server","settle","severe","shadow","shaped","shared","shield","shower","signal","silent","silver","simple","simply","single","sister",
  "sketch","slight","slowly","smooth","soccer","social","solely","sought","source","speech","sphere","spirit","spread","spring","square","stable","stance","status","steady","stolen",
  "strain","strand","stream","street","stress","strict","strike","string","stroke","strong","struck","studio","submit","sudden","suffer","summer","summit","sunset","superb","supply",
  "surely","survey","switch","symbol","system","tackle","talent","target","temple","tender","tenure","terror","thanks","thirty","though","thread","throat","throne","thrown","tissue",
  "tongue","toward","treaty","tribal","tunnel","twelve","twenty","unborn","unfair","unique","united","unlike","update","uphold","urgent","useful","valley","varied","vendor","versus",
  "vessel","victim","viewer","virgin","vision","visual","voyage","walker","warmth","wealth","weapon","weekly","weight","widely","window","winter","wisdom","within","wonder","wooden",
  "worker","worthy","writer","yellow",
  // 7+ letter
  "ability","absence","academy","account","achieve","acquire","address","advance","adverse","adviser","against","airline","already","analyst","ancient","another","anxiety","anybody",
  "applied","arrange","arrival","article","assault","auction","average","balance","banking","bargain","barrier","battery","bearing","because","bedroom","believe","beneath","benefit",
  "besides","between","billion","blanket","bonding","borough","breathe","briefly","brother","brought","builder","cabinet","calcium","calling","capable","capital","capture","careful",
  "catalog","ceiling","central","century","certain","chamber","channel","chapter","charity","charter","cheaper","chicken","chronic","circuit","citizen","climate","cluster","coastal",
  "complex","concept","concern","conduct","confirm","connect","consent","contain","content","context","control","convert","correct","council","counter","country","coupled","courage",
  "crucial","culture","current","cutting","damaged","dealing","decline","defence","deficit","deliver","density","deposit","derived","despite","destroy","digital","display","dispute",
  "distant","diverse","divided","divorce","donated","eastern","economy","edition","elderly","element","embrace","emotion","emperor","endless","enforce","enhance","enormous","episode",
  "essence","evening","evident","examine","example","excited","exclude","execute","exhibit","expense","explain","exploit","explore","exposed","express","extract","extreme","factory",
  "faculty","failing","failure","farmers","fashion","feature","federal","fiction","fighter","finally","finance","finding","fishing","fitness","foreign","forever","formula","fortune",
  "forward","founded","freedom","funding","funeral","further","gallery","gateway","general","genetic","genuine","gesture","glimpse","glitter","graphic","gravity","greatly","growing",
  "habitat","halfway","handler","hanging","harbour","heading","healthy","hearing","heating","heavily","helpful","herself","highway","himself","history","holding","holiday","horizon",
  "hostile","housing","however","hundred","illegal","illness","imagine","immense","imagine","improve","in","include","install","instead","intense","interim","invalid","involve","jointly",
  "journal","journey","justice","justify","keeping","killing","kitchen","lacking","landing","largest","lasting","leading","leather","learned","leaving","legally","lending","lengthy",
  "liberty","library","licence","limited","linking","listing","literal","locally","logical","longest","looking","lottery","loyalty","machine","managed","manager","married","massive",
  "maximum","meaning","measure","medical","meeting","mention","mercury","mineral","minimum","million","miracle","mission","mistake","mixture","monitor","monthly","morning","western",
  "mystery","natural","neither","network","neutral","notable","nothing","nuclear","nursing","obvious","offense","officer","ongoing","opening","operate","opinion","organic","outline",
  "outlook","outside","overall","overlap","oversee","partner","passage","passing","passion","patient","pattern","payment","penalty","pending","pension","percent","perfect","perform",
  "perhaps","persist","picture","pioneer","placing","planned","planner","plastic","pleased","pointed","popular","portion","poverty","precise","predict","premier","premium","prepare",
  "present","prevent","primary","printer","privacy","private","problem","proceed","process","produce","product","profile","program","project","promise","promote","protect","protein",
  "protest","provide","publish","pulling","purpose","pushing","qualify","quarter","quickly","radical","readily","reality","realize","receipt","receive","recover","recruit","reflect",
  "refugee","remains","removal","removed","renewal","replace","request","require","reserve","resolve","respect","respond","restore","retired","retreat","revenue","reverse","revival",
  "routine","running","satisfy","scholar","science","scratch","himself","section","segment","serious","service","session","setting","seventh","several","shelter","silence","similar",
  "sitting","skilled","slavery","smoking","society","soldier","somehow","speaker","special","sponsor","squeeze","stadium","started","startup","stating","station","storage","strange",
  "stretch","student","subject","succeed","success","suggest","summary","support","supreme","surface","surplus","survive","suspect","sustain","teacher","tension","therapy","thereby",
  "thought","through","tonight","totally","tourism","tourist","towards","tragedy","trading","traffic","trainer","trouble","turning","typical","undergo","unified","unknown","unusual",
  "updated","upgrade","urgency","usually","utility","vaccine","variety","vehicle","venture","version","veteran","violent","visible","visitor","vitamin","walking","wanting","warning",
  "warrant","weather","website","wedding","weekend","welfare","western","whereas","willing","without","witness","working","writing","written",
  "absolute","abstract","academic","accurate","actually","addition","adequate","adjacent","advanced","advocate","afforded","aircraft","alliance","although","ambition","analysis",
  "ancestor","announce","anything","anywhere","apparent","appetite","approach","approval","argument","assemble","assuming","athletic","audience","bachelor","backward","balanced",
  "bankrupt","baseline","bathroom","becoming","believed","billions","birthday","blankets","boarding","boundary","breaking","breeding","briefly","bringing","brochure","brothers",
  "building","bulletin","business","calendar","campaign","canadian","capacity","cardinal","carrying","casualty","catching","category","cautious","champion","changing","chapters",
  "charging","chemical","children","choosing","circular","climbing","clinical","coaching","collapse","colonial","colorful","combined","comeback","comedian","commerce","commonly",
  "communal","compared","complain","complete","composed","compound","computer","conclude","concrete","conflict","congress","conquest","consider","consists","constant","consumer",
  "consumed","continue","contrast","controls","convince","corridor","counting","coupling","coverage","creating","creation","creative","creature","criminal","critical","crossing",
  "cultural","currency","customer","Database","daughter","deadline","december","deciding","decision","declared","decrease","dedicate","defender","defining","definite","delegate",
  "delicate","delivery","demanded","democRat","departed","describe","designer","detailed","detected","diabetes","dialogue","dialogue","diamond","directed","director","disabled",
  "disaster","disclose","discount","discover","disorder","dispatch","disposal","disposed","distinct","district","dividend","doctrine","document","domestic","dominant","donation",
  "doubtful","dramatic","drinking","dropping","durable","duration","earnings","economic","educated","educator","EffEctive","election","electric","electron","eligible","embedded",
  "emerging","emission","emphasis","employed","employee","employer","enabling","enclosed","encoding","enormity","enormous","entirely","entitled","envelope","equality","equation",
  "equipped","estimate","evaluate","evidence","everyday","everyone","exchange","exciting","executed","exercise","expected","explicit","explorer","exponent","exported","exposure",
  "extended","external","facebook","facility","familiar","favorite","featured","feedback","feminist","festival","fifteenth","fighting","filename","finalist","finalize","finally",
  "finances","findings","finished","firmware","flagship","flexible","floating","followed","follower","football","foothold","forecast","foremost","formerly","formally","founding",
  "fourteen","fraction","fragment","franklin","frequent","friendly","frontier","fulltime","function","gambling","gasoline","gathered","generate","generous","genetics","genocide",
  "ghosting","gigantic","glancing","governor","graceful","graduate","graphite","grateful","grounded","guardian","guidance","habitual","hallmark","handbook","handling","handsome",
  "happened","hardware","harmless","headline","heighten","heritage","hesitant","highland","historic","homeland","homework","honestly","horrible","hospital","hostility","Humanity",
  "humility","humorous","hydrogen","identify","ideology","ignorant","illusion","imagined","Immature","imperial","implicit","imported","imposing","improved","incident","includes",
  "increase","indicate","indirect","indulge","industry","inferior","infinite","informed","inherent","initiate","innocent","innovate","inspired","instance","integral","intended",
  "interact","interest","internal","internet","interval","intimate","invasion","investor","involved","ironical","isolated","judgment","judicial","junction","keyboard","knockout",
  "labeling","landlord","language","launched","laureate","laughter","lavender","lawfully","learning","leftover","lemonade","leverage","lifetime","lighting","likewise","limiting",
  "lingered","literary","literary","livelIHo","location","lockdown","lonesome","longoing","maintain","majority","managing","manifest","marathon","marginal","marriage","material",
  "maturity","maximize","meanwhile","measured","mechanic","medieval","membrane","memorial","merchant","midnight","military","minimize","minister","minority","miracles","missions",
  "mistaken","moderate","modified","molecule","momentum","monetary","monopoly","moreover","mortgage","movement","multiply","mUnicipl","murderer","mutation","mystical","national",
  "navigate","nEcessar","negative","neighbor","neuronal","newcomer","nominate","nonsense","normally","northern","notebook","november","numerous","objected","obtained","occupied",
  "occurred","offering","official","offshore","Olympics","omission","openness","operated","operator","opponent","opposite","ordering","ordinary","organism","organize","oriental",
  "original","orthodox","outlined","overcome","overhead","overlook","overtake","overtime","overview","packaged","painting","parallel","parental","partisan","passport","patience",
  "peaceful","peasants","peculiar","pedagogy","perceive","periodic","personal","persuade","petition","Physical","pilgrims","pipeline","platform","pleasant","pleasure","plunging",
  "pointing","polished","politics","populace","populate","portable","portrait","positive","possible","postpone","potatoes","powerful","practice","precious","predator","pregnant",
  "premiere","premises","presence","preserve","pressing","prestige","pretense","prevails","previous","princess","printing","priority","prisoner","probable","probably","proceeds",
  "producer","profound","progress","projects","prolific","promised","prompted","properly","property","proposal","proposed","prospect","protocol","province","publicly","purchase",
  "pursuing","qualifed","quantity","quarters","reaction","readable","rearrang","reasoned","received","recently","reckoned","recovery","recycled","redirect","reducing","referral",
  "referral","reformed","regional","register","regulate","reinvent","relating","relation","relative","relaxing","relevant","reliable","relieved","religion","remained","remember",
  "reminded","renowned","repeated","replaced","reported","reporter","required","research","reserved","resident","resigned","resolved","resource","response","restless","restored",
  "restrict","retained","retiring","returned","revealed","reversal","reviewer","revision","revolved","rigorous","romantic","rotation","rubbish","sabotage","sandwich","saturday",
  "scenario","schedule","scholars","scrutiny","seasonal","seconded","securing","security","sensible","sentence","separate","sequence","sergeant","settling","severely","shipping",
  "shocking","shooting","shopping","shortage","shoulder","sideways","signaled","silently","simplify","situated","skeleton","sleeping","slightly","smallest","smoothly","snapshot",
  "socalled","solution","somebody","sometime","southern","speaking","specific","specimen","spectrum","spending","sporting","sporting","staffing","stagnant","standard","standing",
  "startled","starting","starvation","steadily","stepping","stimulus","straight","stranger","strategy","streamer","strength","stressed","strictly","striking","strongly","struggle",
  "stunning","suburban","suddenly","suffered","suitable","superior","supplied","supplier","supposed","suppress","surgical","surprise","surround","survived","survivor","suspense",
  "suspects","suspended","symbolic","sympathy","syndrome","tactical","tangible","teaching","teammate","teamwork","teenager","template","temporal","terminal","terrible","terrific",
  "textbook","thankful","theAtRIc","theology","thinking","thirteen","thorough","thousand","thriller","timeline","together","tolerant","tomorrow","touching","tracking","training",
  "treasure","treasury","treatise","triangle","trillion","tropical","troubled","tutorial","umbrella","unaware","uncommon","underway","unfairly","universe","unlikely","unlocked",
  "unsigned","upcoming","updating","upgraded","validity","valuable","variable","velocity","ventures","vertical","veterans","violence","Virginia","virtuous","visiting","volatile",
  "volatile","volcanic","voluntar","weakness","weaponry","welcOmed","whatever","whenever","wherever","whispers","wildlife","wireless","withdraw","witHdrew","wonderFl","woodland",
  "workload","workshop","yourself"
];

// Initialize word set
WORD_LIST.forEach(w => VALID_WORDS.add(w.toLowerCase()));

type GameState = "idle" | "countdown" | "playing" | "gameover" | "leaderboard";

const WordChainGame = () => {
  const { user } = useAuth();
  const { topScores, userBest, saveScore, refetch } = useWordChainScores();
  const { isMuted, toggleMute, playHit, playLevelUp, playGameOver, startMusic, stopMusic, sfxMuted, musicMuted, toggleSfx, toggleMusic } = useGameAudio("wordchain");

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [wordsFound, setWordsFound] = useState(0);
  const [chain, setChain] = useState(0);
  const [maxChain, setMaxChain] = useState(0);
  const [longestWord, setLongestWord] = useState("");
  const [lastLetter, setLastLetter] = useState("");
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState<{text: string; ok: boolean} | null>(null);
  const [wordHistory, setWordHistory] = useState<string[]>([]);
  const [prevStageIdx, setPrevStageIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stage = getStage(wordsFound);
  const stageIdx = STAGES.indexOf(stage);

  const startGame = useCallback(() => {
    // Pick a random starting letter
    const letters = "abcdefghijklmnoprstw";
    const startLetter = letters[Math.floor(Math.random() * letters.length)];
    setScore(0);
    setWordsFound(0);
    setChain(0);
    setMaxChain(0);
    setLongestWord("");
    setLastLetter(startLetter);
    setUsedWords(new Set());
    setInput("");
    setFeedback(null);
    setWordHistory([]);
    setTimeLeft(15);
    setPrevStageIdx(0);
    setGameState("countdown");
  }, []);

  const onCountdownComplete = useCallback(() => {
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        if (prev <= 4) playHit();
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, wordsFound]); // restart on new word

  // Game over on time out
  useEffect(() => {
    if (gameState === "playing" && timeLeft <= 0) {
      playGameOver();
      stopMusic();
      setGameState("gameover");
      if (user && score > 0) {
        saveScore(score, wordsFound, longestWord, maxChain);
      }
    }
  }, [timeLeft, gameState]);

  // Stage up
  useEffect(() => {
    if (stageIdx > prevStageIdx && gameState === "playing") {
      playLevelUp();
      setPrevStageIdx(stageIdx);
    }
  }, [stageIdx, prevStageIdx, gameState]);

  const submitWord = useCallback(() => {
    const word = input.trim().toLowerCase();
    setInput("");

    if (word.length < stage.minLen) {
      setFeedback({ text: `Min ${stage.minLen} letters!`, ok: false });
      playGameOver();
      setChain(0);
      return;
    }

    if (word[0] !== lastLetter) {
      setFeedback({ text: `Must start with "${lastLetter.toUpperCase()}"`, ok: false });
      playGameOver();
      setChain(0);
      return;
    }

    if (usedWords.has(word)) {
      setFeedback({ text: "Already used!", ok: false });
      playGameOver();
      setChain(0);
      return;
    }

    if (!VALID_WORDS.has(word)) {
      setFeedback({ text: "Not a valid word!", ok: false });
      playGameOver();
      setChain(0);
      return;
    }

    // Valid word!
    const wordScore = word.length * 10 + (chain * 5);
    playLevelUp();
    setScore(prev => prev + wordScore);
    setWordsFound(prev => prev + 1);
    setChain(prev => {
      const newChain = prev + 1;
      setMaxChain(mc => Math.max(mc, newChain));
      return newChain;
    });
    if (word.length > longestWord.length) setLongestWord(word);
    setLastLetter(word[word.length - 1]);
    setUsedWords(prev => new Set([...prev, word]));
    setWordHistory(prev => [word, ...prev.slice(0, 9)]);
    setFeedback({ text: `+${wordScore}`, ok: true });

    // Reset timer for new word
    if (timerRef.current) clearInterval(timerRef.current);
    const newStage = getStage(wordsFound + 1);
    setTimeLeft(newStage.time);

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, lastLetter, usedWords, stage, chain, wordsFound, longestWord]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitWord();
    }
  };

  const CRTOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-30"
      style={{ background: "repeating-linear-gradient(0deg, rgba(255,85,0,0.04) 0px, transparent 1px, transparent 2px)", mixBlendMode: "multiply" }} />
  );

  // ─── LEADERBOARD ─────────────────────────────────────────
  if (gameState === "leaderboard") {
    return (
      <GameLeaderboard
        scores={topScores}
        userBest={userBest}
        gameName="WORDSMITH"
        scoreLabel="SCORE"
        onBack={() => setGameState("idle")}
        onPlayAgain={startGame}
        onRefresh={refetch}
        renderExtra={(entry: any) => (
          <span className="text-xs text-muted-foreground ml-1">
            {entry.words_found}w
          </span>
        )}
      />
    );
  }

  // ─── IDLE ─────────────────────────────────────────────────
  if (gameState === "idle") {
    return (
      <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
        <CRTOverlay />
        <div className="relative z-10 flex flex-col items-center justify-center py-12 px-6 gap-6">
          <div className="w-16 h-16 rounded-xl border border-primary/30 flex items-center justify-center" style={{ background: "rgba(255,85,0,0.1)" }}>
            <Type className="w-8 h-8 text-primary" style={{ filter: "drop-shadow(0 0 8px rgba(255,85,0,0.6))" }} />
          </div>
          <div className="text-center">
            <h2 className="font-display text-2xl tracking-wider text-primary" style={{ textShadow: "0 0 20px rgba(255,85,0,0.4)" }}>WORDSMITH</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">Chain words together — each word must start with the last letter of the previous. Timer shrinks, minimum length grows. How far can you go?</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={startGame} className="font-display tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              <Type className="w-4 h-4 mr-2" /> START
            </Button>
            <Button onClick={() => { refetch(); setGameState("leaderboard"); }} variant="outline" className="font-display tracking-wider border-primary/30">
              <Trophy className="w-4 h-4 mr-2" /> RANKS
            </Button>
          </div>
          {userBest !== null && (
            <p className="text-xs text-muted-foreground font-display tracking-wider">YOUR BEST: <span className="text-primary">{userBest}</span></p>
          )}
        </div>
      </div>
    );
  }

  // ─── GAME OVER ─────────────────────────────────────────────
  if (gameState === "gameover") {
    return (
      <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
        <CRTOverlay />
        <div className="relative z-10 flex flex-col items-center py-10 px-6 gap-5">
          <h2 className="font-display text-xl tracking-wider text-red-400" style={{ textShadow: "0 0 12px rgba(239,68,68,0.4)" }}>TIME'S UP</h2>
          <div className="font-display text-5xl text-primary" style={{ textShadow: "0 0 30px rgba(255,85,0,0.5)" }}>{score}</div>
          <div className="grid grid-cols-3 gap-4 text-center w-full max-w-xs">
            <div><p className="text-2xl font-bold text-foreground">{wordsFound}</p><p className="text-xs text-muted-foreground">WORDS</p></div>
            <div><p className="text-2xl font-bold text-foreground">{maxChain}</p><p className="text-xs text-muted-foreground">BEST CHAIN</p></div>
            <div><p className="text-2xl font-bold text-foreground">{longestWord.length}</p><p className="text-xs text-muted-foreground">LONGEST</p></div>
          </div>
          {longestWord && <p className="text-sm text-muted-foreground">Longest: <span className="text-primary font-bold">{longestWord.toUpperCase()}</span></p>}
          {userBest !== null && score > userBest && (
            <p className="text-sm text-yellow-400 font-display tracking-wider animate-pulse">🏆 NEW PERSONAL BEST!</p>
          )}
          <div className="flex gap-3 mt-2">
            <Button onClick={startGame} className="font-display tracking-wider bg-primary hover:bg-primary/90 px-6">
              <RotateCcw className="w-4 h-4 mr-2" /> AGAIN
            </Button>
            <Button onClick={() => { refetch(); setGameState("leaderboard"); }} variant="outline" className="font-display tracking-wider border-primary/30">
              <Trophy className="w-4 h-4 mr-2" /> RANKS
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAYING ───────────────────────────────────────────────
  const timerPct = (timeLeft / stage.time) * 100;
  const timerColor = timeLeft <= 3 ? "bg-red-500" : timeLeft <= 5 ? "bg-yellow-500" : "bg-primary";

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
      <CRTOverlay />
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="font-display text-sm tracking-wider text-primary">{stage.label}</div>
            <div className="text-xs text-muted-foreground font-display">{stage.name}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-lg text-primary" style={{ textShadow: "0 0 10px rgba(255,85,0,0.4)" }}>{score}</span>
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
          <motion.div className={`h-full ${timerColor} rounded-full`} animate={{ width: `${timerPct}%` }} transition={{ duration: 0.3 }} />
        </div>

        {/* Chain & stats */}
        <div className="flex items-center justify-between mb-4 text-xs font-display tracking-wider">
          <span className="text-muted-foreground">WORDS: <span className="text-foreground">{wordsFound}</span></span>
          <span className="text-muted-foreground">CHAIN: <span className={chain >= 3 ? "text-yellow-400" : "text-foreground"}>{chain}🔗</span></span>
          <span className="text-muted-foreground">MIN: <span className="text-foreground">{stage.minLen}</span> LETTERS</span>
        </div>

        {/* Target letter */}
        <div className="text-center mb-4">
          <p className="text-xs text-muted-foreground font-display tracking-wider mb-2">NEXT WORD STARTS WITH</p>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl border-2 border-primary/40 bg-primary/10">
            <span className="font-display text-4xl text-primary" style={{ textShadow: "0 0 20px rgba(255,85,0,0.6)" }}>
              {lastLetter.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Input */}
        <div className="relative mb-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
            onKeyDown={handleKeyDown}
            placeholder={`Type a word starting with ${lastLetter.toUpperCase()}...`}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-display tracking-wider text-center text-lg focus:outline-none focus:border-primary/50"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        <Button onClick={submitWord} className="w-full font-display tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!input.trim()}>
          SUBMIT
        </Button>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.text + Date.now()}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center mt-3 font-display text-sm tracking-wider ${feedback.ok ? "text-green-400" : "text-red-400"}`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word history */}
        {wordHistory.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {wordHistory.map((w, i) => (
              <span key={i} className={`text-xs px-2 py-1 rounded-lg border font-display tracking-wider ${i === 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
                {w.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3-2-1 Countdown */}
      {gameState === "countdown" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <GameCountdown onComplete={onCountdownComplete} gameName="WORD CHAIN" />
        </div>
      )}
    </div>
  );
};

export default WordChainGame;
