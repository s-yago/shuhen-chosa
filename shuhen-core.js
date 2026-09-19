/* ══════════════════════════════════════════════════════════════
   shuhen-core.js — ViVi不動産 社内ツール 共通部品
   富山市の学区判定／用途地域・都市計画判定／Google Maps 連携／地図描画
   置き場所: https://s-yago.github.io/shuhen-chosa/shuhen-core.js
   別ツールからは <script src="/shuhen-chosa/shuhen-core.js"></script> で読み込む。
   toyama-toshi.json はこのファイルと同じ場所から自動で読まれる。
   ────────────────────────────────────────────────────────────── */
// 富山市小中学校通学区域表（令和6年8月4日改正）
// 原文の表記をそのまま保持し、範囲展開・例外フラグはパーサ側で処理する
const GAKKU_RAW = [
["芝園","芝園","安住町、荒町、磯部町一丁目、一番町、今木町、越前町、蛯町、大手町、鹿島町一丁目～二丁目、小島町、桜木町、桜橋通り、桜町一丁目～二丁目、七軒町、芝園町一丁目～三丁目、白銀町、新川原町、新桜町、新総曲輪、砂町、諏訪川原一丁目～三丁目、総曲輪一丁目～四丁目、千歳町一丁目～二丁目、常盤町、豊川町、土居原町(6番16～19号のみ)、西四十物町、西町、旅籠町、八人町、日之出町、東田地方町一丁目(1,2,5,6番)、平吹町、舟橋北町、舟橋南町、本町、本丸、丸の内一丁目～三丁目、安野屋町一丁目～三丁目、愛宕町一丁目～二丁目、牛島町、牛島本町一丁目～二丁目、内幸町、木場町、新富町一丁目～二丁目、神通本町一丁目～二丁目、神通町一丁目～三丁目、宝町一丁目～二丁目、舟橋今町、湊入船町(14～16番のみ)、明輪町、安田町"],
["中央","南部","石倉町、梅沢町一丁目～三丁目、太田口通り一丁目～三丁目、上本町、小泉町中部、小泉町北部、五番町、山王町、三番町、辰巳町一丁目～二丁目、中央通り一丁目～三丁目、堤町通り一丁目～二丁目、中野新町一丁目～二丁目、西中野本町(3番3,7,11～13号を除く)、西中野町一丁目(15番11～14,28,31,34,40,42,43,46号を除く)、西中野町二丁目、古鍛冶町、星井町一丁目～三丁目、南新町、南田町一丁目～二丁目、室町通り一丁目～二丁目"],
["中央","大泉","旭町、大泉北町、大泉東町一丁目、大泉町三丁目、音羽町一丁目、音羽町二丁目(1番12～15号,2番14～17号,3番12～18号,4,5番を除く)、雄山町、清水中町、清水町一丁目～九丁目、西公文名町、元町一丁目"],
["西田地方","南部","相生町、磯部町二丁目～四丁目、新根塚町一丁目、千石町一丁目～六丁目、土居原町(6番16～19号を除く)、長柄町一丁目～三丁目、西山王町、西田地方、西田地方町一丁目～三丁目、布瀬町一丁目～二丁目、花園町一丁目～四丁目、堀端町、桃井町一丁目～二丁目"],
["光陽","南部","今泉西部町、掛尾栄町、掛尾町(字なし354～402,416～460,473～509,512,513番2号～514番1号,515番1～3号,516～548,601～648番のみ／千保寺割125～175番ほかのみ)、黒瀬、黒瀬北町一丁目～二丁目、新根塚町二丁目～三丁目、太郎丸西町一丁目～二丁目、布瀬本町、布瀬町南一丁目～三丁目、根塚町一丁目～四丁目、二口町一丁目～五丁目"],
["柳町","東部","泉町一丁目～二丁目、稲荷町一丁目～三丁目、稲荷町四丁目(4～7番のみ)、於保多町、館出町一丁目～二丁目、東町一丁目～三丁目、緑町一丁目～二丁目、向川原町、柳町一丁目(1番1～6,8～10,16,17,21号、2番2,5,9～11,16～18,25,26,28,29号を除く)、柳町二丁目(1番1,2,4,7,9,11,12,13,15,17,19,21号を除く)、柳町三丁目(1番1,2,5～8,19,20号、2番1,17号、3番5,25号を除く)"],
["柳町","奥田","稲荷園町、稲荷町四丁目(1～3番のみ)、稲荷元町一丁目～三丁目、北新町一丁目～二丁目、千歳町三丁目、東田地方町一丁目(3,4番のみ)、東田地方町二丁目、柳町一丁目(1番1～6,8～10,16,17,21号、2番2,5,9～11,16～18,25,26,28,29号のみ)、柳町二丁目(1番1,2,4,7,9,11,12,13,15,17,19,21号のみ)、柳町三丁目(1番1,2,5～8,19,20号、2番1,17号、3番5,25号のみ)、柳町四丁目、弥生町一丁目～二丁目"],
["堀川","大泉","大泉東部、大泉中町、大泉東町二丁目"],
["堀川","堀川","今泉、今泉北部町、大泉1区南部、大泉中部、大泉本町一丁目～二丁目、大泉町一丁目～二丁目、大町1区西部、大町1区中部、大町1区北部、大町2区、掛尾町(字なし354～402ほかを除く／千保寺割125～175番ほかを除く)、小泉町東部、小泉町南部、太郎丸1区～2区、太郎丸本町一丁目～四丁目、西大泉、西中野本町(3番3,7,11～13号のみ)、西中野町一丁目(15番11～14,28,31,34,40,42,43,46号のみ)、根塚町、東中野町一丁目～三丁目、堀川小泉町1区～2区、堀川小泉町一丁目～二丁目"],
["堀川南","堀川","大町1区南部、大町南台、上新保、上堀町、上堀南町、清住町、下堀、堀川本郷、堀川天山町、堀川町、本郷新、本郷町1区～5区"],
["東部","東部","石金一丁目～三丁目、経堂四丁目(10番18,21号のみ)、長江1区、長江一丁目～五丁目、長江新町一丁目～四丁目、長江東町一丁目(8番10号、9番8号を除く)、長江東町二丁目～三丁目、長江本町(10番45号、11番7,11～13,21～26,32号、12番13～18,33号を除く)、西長江一丁目～四丁目、西長江本町、東石金町(9番53～55,58号を除く)、不二越本町一丁目、不二越本町二丁目(2番を除く)、不二越町(14番6,21～23,30,33,36,39,41,43,45,48,52～54,58号、17番、18番を除く)"],
["東部","大泉","音羽町二丁目(1番12～15号,2番14～17号,3番12～18号,4,5番のみ)、栄町一丁目～三丁目、清水元町、住吉町一丁目～二丁目、元町二丁目"],
["奥田","奥田","赤江町、曙町、牛島新町、永楽町、奥井町、奥田寿町、奥田新町、奥田双葉町、奥田本町、奥田町、窪新町、窪本町、下奥井一丁目～二丁目、下新町、城北町、久方町、湊入船町(1～13番のみ)、四ツ葉町"],
["奥田北","奥田","粟島町一丁目～三丁目、興人町、下赤江町二丁目(14番の一部・別図面あり)、下新北町、下新西町、下新日曹町、下新本町、千代田町、中島一丁目～五丁目、松若町"],
["桜谷","西部","安養坊、石坂、石坂東町、駒見、五艘、桜谷みどり町一丁目～二丁目、田刈屋、田刈屋新町、畑中"],
["五福","西部","金屋1区～4区、五福1区～6区、五福8区～10区、五福新町、五福末広町、下野新、寺町1区～4区、寺町6区、寺町けや木台、鵯島1区～3区、ひよどり南台、文京町一丁目～三丁目"],
["神明","西部","有明町1区～3区、有沢、有沢新町、久郷、下野、庄高田、高田、羽根1区～3区"],
["岩瀬","岩瀬","岩瀬赤田町1区～2区、岩瀬荒木町、岩瀬入船町、岩瀬梅本町、岩瀬大町、岩瀬御蔵町、岩瀬表町、岩瀬祗園町、岩瀬古志町、岩瀬古志町1区、岩瀬諏訪町、岩瀬萩浦町、岩瀬文化町、岩瀬松原町、岩瀬港町、岩瀬幸町、岩瀬堺町、岩瀬新町1区～2区、岩瀬神明町、岩瀬天神町1区～2区、岩瀬土場町、岩瀬仲町、岩瀬新川町1区～2区、岩瀬白山町1区～2区、岩瀬福来町"],
["萩浦","岩瀬","上野新町(2番86,89,91,92,93号のみ)、高畠町一丁目～二丁目、千原崎、千原崎一丁目～二丁目、西宮町、蓮町一丁目～六丁目、森、森住町(10番10号を除く)、森若町、森一丁目～二丁目、森三丁目(12番を除く)、森四丁目～五丁目"],
["大広田","北部","海岸通、海岸通新町、加古町、銀嶺町、住友町、清風町、田畑新町、田畑南部、田畑北部、永久町、中田、中田一丁目～三丁目、那智町、晴海台、東ヶ丘、東富山寿町一丁目～三丁目、松浦町、森住町(10番10号のみ)、森三丁目(12番のみ)"],
["浜黒崎","北部","古志町一丁目～六丁目、野田、浜黒崎第1区、浜黒崎浜通り、浜黒崎本町、針日、日方江第1区～第2区、平榎、横越"],
["針原","北部","楠木、下飯野、高島、道正、野中、針原中町、町袋、宮条、宮園町、宮成、宮成中部、宮町"],
["針原","新庄","小西、針原新町1区～3区、針原新町4区南部、針原新町4区北部、針原新町5区、三上"],
["豊田","岩瀬","犬島一丁目～六丁目、犬島七丁目(1番1～3号を除く)、犬島新町一丁目～二丁目、上野新町(2番86,89,91,92,93号を除く)、城川原一丁目～三丁目、高園町、豊丘町、豊島町、豊城新町、豊城町、豊田本町一丁目(1番1,46、11番21号、12番5～32号、13番14,18,20号、15番3号のみ)、豊田本町二丁目(1番8,23～32,34～44号、2番44号、8番4,9,27～30号、9番3号、13番45～50号のみ)、豊若町二丁目(1番43～66号、8番1,62～69号のみ)"],
["豊田","北部","犬島七丁目(1番1～3号のみ)、豊田、豊田本町一丁目(一部は岩瀬中学校区)、豊田本町二丁目(一部は岩瀬中学校区)、豊田本町三丁目～四丁目、豊若町一丁目、水落、水落一丁目、豊若町二丁目(1番43～66号、8番1,62～69号を除く)、豊若町三丁目、米田、米田すずかけ台一丁目～三丁目、米田町一丁目～三丁目、緑陽町"],
["豊田","奥田","下冨居一丁目～二丁目、豊田町一丁目～二丁目"],
["広田","奥田","上赤江町一丁目～二丁目、下赤江町一丁目、下赤江町二丁目(14番の一部を除く・別図面あり)"],
["広田","新庄","新屋、新屋新町、飯野、上冨居、上冨居一丁目～三丁目、上冨居新町、新冨居、千成町、鶴ヶ丘町、問屋町一丁目～三丁目、中冨居、鍋田、冨居栄町、中冨居新町、下冨居"],
["新庄","新庄","綾田町一丁目～三丁目、荒川一丁目～五丁目、荒川新町、上庄町、経堂、経堂一丁目～三丁目、経堂四丁目(10番18,21号を除く)、新庄本町三丁目、新庄町一丁目(2番1～8号を除く)、新庄町二丁目～四丁目、新庄町第1～第4、新園町、双代町、田中町一丁目～五丁目、常盤台、常盤台2区、長江東町一丁目(8番10号、9番8号のみ)、西新庄、向新庄町一丁目(1番、18番3,47号のみ)、経堂新町"],
["新庄北","新庄","荏原、上飯野、上飯野新町一丁目～五丁目、新庄北町、新庄銀座一丁目～三丁目、新庄北部第1～第5、新庄本町一丁目～二丁目、新庄町一丁目(2番1～8号のみ)、手屋一丁目～三丁目、向新庄第4、向新庄町一丁目(1番、18番3,47号を除く)、向新庄町二丁目、向新庄町三丁目(7番22号旧:日俣は除く)、向新庄町四丁目～八丁目、新庄町"],
["藤ノ木","藤ノ木","朝日、荏原新町、大江干、大江干新町、大島一丁目～四丁目、大島新町、金代、栄新町、新金代一丁目～二丁目、中間島一丁目～二丁目、富岡町、日俣、開、藤代町、藤木、藤木県営住宅、藤木新町、藤の木園町、藤の木台一丁目～三丁目、藤木中町、藤の木緑台、藤見町、町新、向新庄町三丁目(7番22号旧:日俣のみ)"],
["山室","大泉","青葉町、山室2区、山室新町"],
["山室","山室","秋吉、秋吉新町、公文名、高原本町、高原町、高屋敷1区、天正寺、中市、中市一丁目～二丁目、中川原新町、長江本町(10番45号、11番7,11～13,21～26,32号、12番13～18,33号のみ)、東石金町(9番53～55,58号のみ)、不二越本町二丁目(2番のみ)、不二越町(14番6,21～23,30,33,36,39,41,43,45,48,52～54,58号、17番、18番のみ)、山室、山室向陽台"],
["山室中部","山室","新横内町、高屋敷2区、中川原、中川原台一丁目～二丁目、流杉、西野新、東流杉、古寺、古寺新町、町村、町村一丁目～二丁目、松ヶ丘、不二栄町1区～3区、山室荒屋、山室荒屋新町、横内第3、若葉台"],
["太田","山室","石屋、太田北区、太田向陽台、太田中区、太田南町、大場、大宮町、昭和新町、新名、城ヶ丘1区～5区、城新町、城村、城村新町、城若町、関、中屋、西番第1～第3、八川、横内第1～第2"],
["蜷川","堀川","赤田、赤田新町、朝菜町一丁目～六丁目、上袋、黒崎、小杉、新堀町、蜷川、布市、布市新町、二俣、二俣新町、八日町"],
["新保","興南","秋ヶ島、押上、上栗山、上八日町、経田、才覚寺、下栗山、新保、惣在寺、大利、塚原、任海、友杉、南央町、西荒屋、萩原、福居、別名、南栗山、南中田、吉倉"],
["熊野","興南","青柳新、悪王寺、安養寺、石田、石田万葉台、上野、上野寿町、上野南町、江本、上熊野、上栄、経力、小中、島田、下熊野、下千俵、杉瀬、千俵町、辰尾、辰尾新町1区～3区、珠泉西町、珠泉東町、林崎、牧田、南金屋、宮保、森田、吉岡、若竹町一丁目～六丁目"],
["月岡","月岡","青柳、大井、開発、上今町、上千俵、上千俵町、上布目、月岡西緑町、月岡東緑町一丁目～四丁目、月岡町一丁目～七丁目、月見町一丁目～七丁目、中布目"],
["四方","和合","四方、四方荒屋、四方一番町、四方江代町、四方恵比須町、四方北窪、四方新出町、四方神明町、四方田町、四方茶園町、四方西岩瀬、四方西野割町、四方西港町、四方二番町、四方東野割町、四方東港町、四方南町、つばめ野三丁目"],
["八幡","和合","今市、田尻、寺島、利波、八町、八町東、百塚、松木、宮尾、八幡、八幡新町"],
["草島","和合","金山新、金山新桜ヶ丘、金山新東、草島、草島新町、富浦町"],
["倉垣","和合","打出、布目、布目旭、布目新町、布目東町、布目緑町、布目南町、つばめ野一丁目～二丁目"],
["呉羽","呉羽","追分茶屋、呉羽苑、呉羽川西、呉羽貴舟巻、呉羽昭和町、呉羽新富田町、呉羽つつじが丘、呉羽富田町、呉羽中の町、呉羽東町、呉羽姫本、呉羽本町、呉羽丸富町、呉羽水上町、呉羽三ツ塚、住吉、高木、茶屋新町、茶屋町、花木、吉作、吉作新町"],
["長岡","呉羽","北代1区～6区、北代新、北代藤ヶ丘、長岡、長岡新、八ヶ山"],
["寒江","呉羽","大塚、北二ツ屋、呉羽野田、中沖、野口、野町、本郷"],
["古沢","呉羽","境野新、杉谷、栃谷、西金屋、古沢"],
["老田","呉羽","願海寺、願海寺新町、中老田、西二俣、野々上、東老田"],
["池多","呉羽","池多、北押川、坂下新、三熊、西押川、平岡、開ヶ丘、山本"],
["水橋中部","水橋","水橋朝日町、水橋市江、水橋市江新町、水橋稲荷町、水橋新大町、水橋新舘町、水橋新町、水橋地蔵町、水橋田町、水橋中大町、水橋中出町、水橋中村栄町、水橋中村新町、水橋中村町、水橋西天神町、水橋西出町、水橋西浜町、水橋東舘町、水橋東浜町、水橋東天神町、水橋東出町、水橋明治町、水橋館町、水橋柳寺"],
["水橋西部","水橋","水橋荒町、水橋今町、水橋印田町、水橋駅前、水橋川原町、水橋山王町、水橋昭和町、水橋新堂町、水橋新保、水橋新保新町、水橋大正町、水橋立山町、水橋辻ヶ堂、水橋中町、水橋西大町、水橋畠等町、水橋花の井町、水橋浜町"],
["水橋東部","水橋","水橋石政、水橋伊勢領、水橋開発町、水橋鏡田、水橋堅田、水橋上桜木、水橋上砂子坂、水橋狐塚、水橋小池、水橋恋塚、水橋高志園町、水橋五郎丸、水橋桜木、水橋下砂子坂、水橋下砂子坂新"],
["三成","三成","水橋池田舘、水橋池田町、水橋伊勢屋、水橋市田袋、水橋入江、水橋沖、水橋肘崎、水橋開発、水橋金尾、水橋金尾新、水橋上的場、水橋柴草、水橋小路、水橋新堀、水橋常願寺、水橋高堂、水橋中新町、水橋中村、水橋入部町、水橋番頭名、水橋二杉、水橋二ッ屋、水橋的場、水橋石割、水橋金広、水橋北馬場、水橋小出裏坪、水橋小出表坪、水橋小出上屋、水橋小出東町、水橋佐野竹、水橋清水堂、水橋上条新町、水橋専光寺、水橋大正南部、水橋大正北部、水橋高寺、水橋田伏、水橋中馬場、水橋平塚、水橋曲淵"],
["大沢野","大沢野","牛ケ増、笹津1区～7区、春日長走、下夕林、西大沢1区～3区、敷紡寮、高内1区～2区、カーボン2区、幸町1区～2区、八木山1区～3区、上大久保1区～4区、稲代1区～2区、上大久保栄町、上大久保北新町、上大久保東新町、長附1区～7区、南花園町、加納、西塩野、岩木、岩木新、上ニ杉1区～3区、須原、長川原、小羽、葛原、下伏、土、根上"],
["大久保","大沢野","上大久保5区～6区、上大久保泉町、下大久保1区～6区、下大久保東ケ丘、下大久保新町、若草町、新村、合田、東大久保、中大久保、神通、塩、下大久保緑町、大久保新町、下大久保若葉台"],
["船峅","大沢野","寺家、市場、直坂、横樋、大野、南野田、坂本1区～2区、セーナー苑、ニ松、万願寺、万開、松野、小黒"],
["上滝","上滝","大山上野、新上野、上滝緑町、上新町、上滝東新町、上滝東町、六間町、大山北新町、中町、川端町、中滝、三室荒屋、中滝団地、中ノ寺団地、新栄町、新曙町、文珠寺、東小俣、西小俣、長瀬、手出、赤倉、河内、小原、穏土、安蔵、新町、岡田、中番(字小杉割・桑原割・草履田割の一部のみ)、大山松木、牧、才覚地、水須、中地山"],
["大庄","上滝","田畠、善名、下番、下番新町、馬瀬口、中番(字小杉割・桑原割・草履田割の一部を除く)、旭ケ丘、小原屋、大栗、花崎、上大浦、中大浦、下大浦、桑原、南大場、殿様林、津羽見、はなさき苑、風見台、明日美野、グリーンコア大山、青葉台、花みず木台、たばたけ寿町、つくし野"],
["福沢","上滝","東福沢1区～7区、火土呂、中央農高、福沢中央住宅、小佐波、牧野、大山布目、東黒牧、楜ヶ原、小谷、砂見、芋平、日尾、瀬戸、馬瀬、石渕、下双嶺、大清水、大双嶺、小坂、東黒牧上野、東福沢住宅団地、津毛、福沢団地、千長原、長棟、奥山"],
["小見","上滝","和田、小見、亀谷、有峰、本宮、粟巣野、原、本宮はなきり、中地山亀谷入会、小見和田入会、小見亀谷入会"],
["八尾","八尾","八尾町東町、八尾町西町、八尾町鏡町、八尾町上新町、八尾町諏訪町、八尾町西新町、八尾町東新町、八尾町今町、八尾町下新町、八尾町天満町、八尾町妙川寺(一部・別図面あり)、八尾町福島元村、八尾町福島上野、八尾町福島上野市営住宅、八尾町八尾園、八尾町福島第一～第四、八尾町保内二丁目、八尾町上井田新、八尾町下笹原、八尾町掛畑、八尾町上黒瀬、八尾町小原滝脇、八尾町桐谷、八尾町小井波、八尾町上笹原、八尾町茗ケ原、八尾町角間、八尾町梅苑町、八尾町高熊元村、八尾町高熊落合、八尾町高熊団地、八尾町谷橋、八尾町中、八尾町河西、八尾町西玉、八尾町河筋、八尾町坂尾、八尾町中筋、八尾町河東、八尾町足谷、八尾町小長谷台地、八尾町小長谷元村(一部・別図面あり)、八尾町神明、八尾町北玉、八尾町三和、八尾町乗峯、八尾町青根、八尾町西川倉、八尾町東川倉、八尾町東布谷、八尾町布谷、八尾町赤石、八尾町松瀬、八尾町野積園、八尾町のりみね苑、八尾町大下、八尾町下仁歩、八尾町中仁歩、八尾町上仁歩、八尾町入谷、八尾町平沢、八尾町三ツ松、八尾町倉ケ谷、八尾町正間、八尾町大玉生、八尾町尾畑、八尾町武道原、八尾町清花、八尾町栃折、八尾町中栗、八尾町上牧、八尾町島地、八尾町内名、八尾町西高田、八尾町新東、八尾町庵杉、八尾町小長谷雇用促進、八尾町新杉、八尾町樫尾、八尾町岩屋、八尾町宮腰、八尾町外堀、八尾町北東、八尾町晴巒台"],
["杉原","八尾","八尾町黒田、八尾町井田、八尾町上井田、八尾町下井田新、八尾町寺家、八尾町杉田、八尾町大杉、八尾町滅鬼、八尾町薄島、八尾町野飼、八尾町西神通、八尾町中神通、八尾町城生、八尾町井栗谷、八尾町深谷、八尾町丸山"],
["保内","八尾","八尾町高善寺、八尾町舘、八尾町本郷、八尾町田中、八尾町翠尾、八尾町奥田、八尾町奥田夢タウン、八尾町椿寿荘、八尾町三田、八尾町三田城が丘、八尾町平林、八尾町松原、八尾町上新田、八尾町中新田、八尾町下新田、八尾町水谷、八尾町妙川寺(一部を除く・別図面あり)、八尾町妙川寺市営住宅、八尾町石戸、八尾町上高善寺、八尾町保内一丁目、八尾町保内三丁目、八尾町テクノタウン、八尾町水谷望岳台"],
["速星","速星","婦中町笹倉1区～5区、婦中町笹倉8区、婦中町笹倉11区、婦中町笹倉13区、婦中町麦島、婦中町袋、婦中町砂子田1区～5区、婦中町板倉、婦中町増田、婦中町速星1区～5区、婦中町蛍川、婦中町希来里、婦中町西ヶ丘、婦中町響の杜"],
["鵜坂","速星","婦中町下轡田、婦中町上轡田、婦中町塚原、婦中町分田、婦中町鵜坂、婦中町羽根新、婦中町田島、婦中町上田島、婦中町東本郷、婦中町西本郷、婦中町宮ヶ島、婦中町宮ヶ島団地、婦中町下坂倉、婦中町雇用促進下坂倉、婦中町島本郷、婦中町希望ヶ丘、婦中町パークタウン西本郷、婦中町雇用促進西本郷、婦中町夢ヶ丘"],
["朝日","速星","婦中町安田、婦中町小泉、婦中町下下条、婦中町上下条、婦中町下友坂、婦中町上友坂、婦中町総野"],
["宮野","速星","婦中町広田1区～4区、婦中町浜子、婦中町中島、婦中町余川東、婦中町田屋、婦中町地角、婦中町新屋、婦中町横野、婦中町成子、婦中町中名、婦中町道場、婦中町下井沢、婦中町清水島、婦中町堀、婦中町道喜島、婦中町十五丁、婦中町為成新、婦中町青島、婦中町萩島、婦中町持田、婦中町添島、婦中町蔵島、婦中町ねむの木"],
["古里","城山","婦中町長沢(長沢字狐坂13227～13452番地の地区を除く)、婦中町羽根、婦中町下邑、婦中町小長沢、婦中町新町、婦中町蓮花寺、婦中町高塚、婦中町宮ヶ谷、婦中町長沢団地、富山病院、友愛病院、婦中町ひまわり台、婦中町外北(外輪野1455番地3、外輪野字鏡坂11937～12685番地の地区のみ)"],
["音川","城山","婦中町下瀬、婦中町三和、婦中町外南、婦中町西上、婦中町扶養、婦中町外中、婦中町八下、婦中町大構、婦中町中保屋、婦中町瑞穂、婦中町外北(外輪野1455番地3、外輪野字鏡坂11937～12685番地の地区を除く)、婦中町上瀬、婦中町三瀬・高山、婦中町道島・上野、婦中町皆杓、婦中町牛滑、婦中町大瀬谷、婦中町葎原、婦中町鶚谷、婦中町吉谷、婦中町平等、婦中町吉住、婦中町東谷、婦中町東山、婦中町細谷、婦中町円山、婦中町長沢(長沢字狐坂13227～13452番地の地区のみ)"],
["神保","城山","婦中町千里西部、婦中町千里南部、婦中町千里北部、婦中町千里東部、婦中町小倉、婦中町熊野道、婦中町島田、婦中町上井沢、婦中町高日附、婦中町余川西、婦中町富崎、婦中町河原町、婦中町上吉川、婦中町下吉川、婦中町富川、婦中町千里団地、婦中町上吉川ニュータウン、婦中町かたかご台、婦中町千里グリーンハイツ、婦中町高日附学園台"],
["山田","山田","山田高清水、山田深道、山田数納、山田若狭、山田居舟、山田鍋谷、山田谷、山田若土、山田鎌倉、山田小谷、山田赤目谷、山田北山、山田湯、山田中村、山田小島、山田城山、山田上中瀬、山田竹の内、山田中瀬、山田白井谷、山田前田、山田沼又、山田牧、山田清水、山田今山田、山田宿坊、山田沢連、山田柳川、山田大山"],
["神通碧","楡原","東猪谷、舟渡、小糸、伏木、吉野、寺津、町長、布尻、今生津、芦生、西笹津、岩稲、割山、楡原、楡原1区、楡原高田、楡原3区、庵谷、片掛、猪谷、三井アパート、蟹寺、加賀沢"]
];

/* ══════════ 学区判定 ══════════ */
const K2N={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10};
const N2K=["","一","二","三","四","五","六","七","八","九","十"];
function kanjiNum(s){
  if(/^\d+$/.test(s))return parseInt(s,10);
  if(s.length===1)return K2N[s]||null;
  let m=s.match(/^十([一二三四五六七八九])$/); if(m)return 10+K2N[m[1]];
  m=s.match(/^([一二三四五六七八九])十([一二三四五六七八九])?$/);
  if(m)return K2N[m[1]]*10+(m[2]?K2N[m[2]]:0);
  return null;
}
function numToSame(n,sample){
  if(/^\d+$/.test(sample))return String(n);
  if(n<=10)return N2K[n];
  if(n<20)return "十"+N2K[n-10];
  return N2K[Math.floor(n/10)]+"十"+(n%10?N2K[n%10]:"");
}
const RANGE=/^(.*?)(第?)([0-9]+|[一二三四五六七八九十]+)(丁目|区|)～(第?)([0-9]+|[一二三四五六七八九十]+)(丁目|区|)$/;
function expandToken(tok){
  let caution=null,base=tok;
  const p=tok.indexOf("(");
  if(p>=0){caution=tok.slice(p+1).replace(/\)$/,"");base=tok.slice(0,p);}
  const m=base.match(RANGE);
  if(m){
    const[,pre,d1,a,s1,d2,b,s2]=m, na=kanjiNum(a), nb=kanjiNum(b);
    const suf=s1||s2, dai=d1||d2;
    if(na!=null&&nb!=null&&nb>=na&&nb-na<40){
      const out=[];
      for(let i=na;i<=nb;i++)out.push({name:pre+dai+numToSame(i,a)+suf,caution});
      return out;
    }
  }
  return [{name:base,caution}];
}
function normTown(s){
  let t=s.replace(/\s/g,"").replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0));
  return t.replace(/(\d+)丁目/g,(_,n)=>numToSame(parseInt(n,10),"一")+"丁目");
}
function normAddress(s){
  let t=s.replace(/\s|　/g,"").replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0));
  t=t.replace(/[‐‑‒–—―ー－]/g,"-").replace(/^日本[,、]?/,"").replace(/^〒?\d{3}-?\d{4}/,"");
  t=t.replace(/富山県/,"").replace(/富山市/,"");
  t=t.replace(/(\d+)-(\d+)(-(\d+))?/,(mm,a,b,_c,d)=>numToSame(parseInt(a,10),"一")+"丁目"+b+"番"+(d?d+"号":""));
  return t.replace(/(\d+)丁目/g,(_,n)=>numToSame(parseInt(n,10),"一")+"丁目");
}
const TOWN=new Map(), TOWNBASE=new Map();
(function(){
  for(const[e,m,towns]of GAKKU_RAW){
    for(const raw of towns.split("、")){
      const tok=raw.trim(); if(!tok)continue;
      for(const{name,caution}of expandToken(tok)){
        const k=normTown(name); if(!k)continue;
        if(!TOWN.has(k))TOWN.set(k,[]);
        const a=TOWN.get(k);
        if(!a.some(x=>x.e===e&&x.m===m&&x.caution===caution))a.push({e,m,caution,src:name});
      }
    }
  }
  for(const[k,v]of TOWN){
    const b=k.replace(/(第?[0-9一二三四五六七八九十]+区?)?(西部|東部|南部|北部|中部)?$/,"");
    if(!b||b===k)continue;
    if(!TOWNBASE.has(b))TOWNBASE.set(b,[]);
    for(const x of v)if(!TOWNBASE.get(b).some(y=>y.e===x.e&&y.m===x.m))TOWNBASE.get(b).push(x);
  }
})();
let OVR={};
function loadOvr(){try{OVR=JSON.parse(localStorage.getItem("vivi_gakku_ovr")||"{}");}catch(e){OVR={};}}
function saveOvr(){localStorage.setItem("vivi_gakku_ovr",JSON.stringify(OVR));renderOvr();}
function renderOvr(){
  const el=$("#ovr-list"),ks=Object.keys(OVR).sort();
  el.innerHTML=ks.length?ks.map(k=>{
    const[e,m]=OVR[k].split("|");
    return `<span class="ovr"><b>${k}</b> → ${e}小／${m}中<button data-k="${k}" title="削除">✕</button></span>`;
  }).join(""):'<span class="hint">登録はまだありません。</span>';
  el.querySelectorAll("button").forEach(b=>b.onclick=()=>{delete OVR[b.dataset.k];saveOvr();});
  $("#ovr-json").value=JSON.stringify(OVR);
}
function guessTown(addr,matched){
  if(matched)return matched;
  const a=normAddress(addr);
  const m=a.match(/^(.*?[一二三四五六七八九十]丁目)/);
  if(m)return m[1];
  const m2=a.match(/^([^\d]+)/);
  return m2?m2[1].replace(/[番号-].*$/,""):a;
}
function lookupGakku(addr){
  const a=normAddress(addr);
  let ob=null;
  for(const k of Object.keys(OVR)){
    const n=normTown(k);
    if(n&&a.startsWith(n)&&(!ob||n.length>ob.n.length))ob={k,n};
  }
  if(ob){const[e,m]=OVR[ob.k].split("|");return{matched:ob.k,hits:[{e,m,caution:null,src:ob.k}],mode:"override"};}
  let best=null;
  for(const k of TOWN.keys())if(a.startsWith(k)&&(!best||k.length>best.length))best=k;
  if(best)return{matched:best,hits:TOWN.get(best),mode:"exact"};
  let bb=null;
  for(const k of TOWNBASE.keys())if(a.startsWith(k)&&(!bb||k.length>bb.length))bb=k;
  if(bb)return{matched:bb,hits:TOWNBASE.get(bb),mode:"base"};
  return{matched:null,hits:[],mode:"none"};
}
const ALLPAIRS=(()=>{const s=new Set();for(const[e,m]of GAKKU_RAW)s.add(e+"|"+m);return[...s].sort();})();


const CATS=[
 {id:"youji",  label:"幼稚園・保育園", types:["preschool","child_care_agency","school"], text:["保育所","保育園","幼稚園","認定こども園"], r:1500, on:true},
 {id:"conv",   label:"コンビニ",       types:["convenience_store"],             r:1500, on:true},
 {id:"super",  label:"スーパー",       types:["supermarket","grocery_store"],   text:["スーパー"], r:2500, on:true},
 {id:"drug",   label:"ドラッグストア", types:["drugstore","pharmacy"],          text:["ドラッグストア"], r:2500, on:true},
 {id:"sc",     label:"SC",             types:["shopping_mall"],                 r:4000, on:true},
 {id:"post",   label:"郵便局",         types:["post_office"],                   r:2500, on:true},
 {id:"bank",   label:"銀行",           types:["bank"],                          r:2500, on:true},
 {id:"hosp",   label:"病院・クリニック",types:["hospital","doctor"],            text:["病院"], r:3000, on:true},
 {id:"park",   label:"公園",           types:["park"],                          r:1200, on:false},
];
const YOUJI_OK=/保育|幼稚|こども園|子ども園|認定こども/;
const WALK=m=>Math.max(1,Math.ceil(m/80));

/* ══════════ 用途地域・都市計画 ══════════ */
let TOSHI=null;
const NEAR_M=50;   // これ以内に別の用途地域があれば「またがり注意」とする
function ptInRing(x,y,r){
  let inside=false;
  for(let i=0,j=r.length-2;i<r.length;j=i,i+=2){
    const xi=r[i],yi=r[i+1],xj=r[j],yj=r[j+1];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
function ptInPolys(x,y,ps){
  for(const poly of ps){
    if(!ptInRing(x,y,poly[0]))continue;
    let hole=false;
    for(let h=1;h<poly.length;h++)if(ptInRing(x,y,poly[h])){hole=true;break;}
    if(!hole)return true;
  }
  return false;
}
function segDist(px,py,ax,ay,bx,by,kx){
  const AX=(ax-px)*kx,AY=ay-py,BX=(bx-px)*kx,BY=by-py;
  const dx=BX-AX,dy=BY-AY,L=dx*dx+dy*dy;
  let t=L?(-AX*dx-AY*dy)/L:0;
  t=t<0?0:t>1?1:t;
  return Math.hypot(AX+t*dx,AY+t*dy);
}
function distToBoundary(x,y,ps){
  const kx=Math.cos(y*Math.PI/180);
  let m=Infinity;
  for(const poly of ps)for(const r of poly)
    for(let i=0;i+3<r.length;i+=2){
      const d=segDist(x,y,r[i],r[i+1],r[i+2],r[i+3],kx);
      if(d<m)m=d;
    }
  return m*111320;
}
function bboxHit(lng,lat,r,pad){return !(lng<r[0]-pad||lng>r[2]+pad||lat<r[1]-pad||lat>r[3]+pad);}
function lookupToshi(lat,lng){
  const pad=(NEAR_M+10)/111320/Math.cos(lat*Math.PI/180);
  const zones=[],near=[];
  for(const z of TOSHI.youto){
    if(!bboxHit(lng,lat,z.r,pad))continue;
    if(ptInPolys(lng,lat,z.p))zones.push({...z,d:0});
    else{const d=distToBoundary(lng,lat,z.p);if(d<=NEAR_M)near.push({...z,d});}
  }
  let layer=null;
  for(const t of TOSHI.tosi){
    if(!bboxHit(lng,lat,t.r,0))continue;
    if(ptInPolys(lng,lat,t.p)&&(layer===null||t.l<layer))layer=t.l;
  }
  near.sort((a,b)=>a.d-b.d);
  return{zones,near,layer,layerName:layer?TOSHI.meta.layers[layer]:"都市計画区域外"};
}

/* ══════════ Google API ══════════ */
let gReady=null, authFailed=false;
function loadGoogle(key){
  if(gReady)return gReady;
  window.gm_authFailure=()=>{
    authFailed=true;
    say("Google がこのAPIキーを拒否しました。原因は次のどれかです。<br>"+
        "・請求先アカウント（お支払い情報）が未設定<br>"+
        "・APIキーの「APIの制限」に Geocoding API / Places API (New) / Distance Matrix API が入っていない<br>"+
        "・リファラーに https://s-yago.github.io/* が入っていない","err");
    $("#run").disabled=false;$("#run").textContent="調査する";
  };
  gReady=new Promise((res,rej)=>{
    window.__gcb=()=>res();
    const s=document.createElement("script");
    s.src="https://maps.googleapis.com/maps/api/js?key="+encodeURIComponent(key)+
          "&v=weekly&language=ja&region=JP&loading=async&callback=__gcb";
    s.onerror=()=>rej(new Error("Google Maps の読み込みに失敗しました。ネットワークとAPIキーを確認してください。"));
    document.head.appendChild(s);
  });
  return gReady;
}
function withTimeout(p,ms,label){
  return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>{
    rej(new Error(label+"が"+Math.round(ms/1000)+"秒以内に終わりませんでした。F12キーでコンソールを開き、Googleからのエラー内容を確認してください。"));
  },ms))]);
}
async function geocode(addr){
  const {Geocoder}=await google.maps.importLibrary("geocoding");
  const q=/富山市/.test(addr)?addr:("富山市"+addr);
  const r=await new Geocoder().geocode({address:"富山県"+q.replace(/^富山県/,""),region:"jp",componentRestrictions:{country:"JP"}});
  if(!r.results||!r.results.length)throw new Error("住所が特定できませんでした。表記を変えて試してください。");
  const g=r.results[0];
  return{lat:g.geometry.location.lat(),lng:g.geometry.location.lng(),
         formatted:g.formatted_address, prec:g.geometry.location_type};
}
const PREC={ROOFTOP:["建物単位",false],RANGE_INTERPOLATED:["番地から推定",true],
            GEOMETRIC_CENTER:["区画の中心",true],APPROXIMATE:["おおよその位置",true]};
async function nearby(center,types,radius,n){
  const {Place,SearchNearbyRankPreference}=await google.maps.importLibrary("places");
  try{
    const{places}=await Place.searchNearby({
      fields:["displayName","location"],
      locationRestriction:{center:new google.maps.LatLng(center.lat,center.lng),radius:radius},
      includedTypes:types, maxResultCount:n||5,
      rankPreference:SearchNearbyRankPreference.DISTANCE, language:"ja", region:"jp"
    });
    return places.map(p=>({name:p.displayName,lat:p.location.lat(),lng:p.location.lng()}));
  }catch(e){console.warn("nearby失敗",types,e);return[];}
}
async function textNear(q,center,radius,n){
  const {Place,SearchByTextRankPreference}=await google.maps.importLibrary("places");
  try{
    const{places}=await Place.searchByText({
      textQuery:q, fields:["displayName","location"], maxResultCount:n||5,
      locationBias:{center:new google.maps.LatLng(center.lat,center.lng),radius:radius},
      rankPreference:SearchByTextRankPreference.DISTANCE, language:"ja", region:"jp"
    });
    return places.map(p=>({name:p.displayName,lat:p.location.lat(),lng:p.location.lng()}));
  }catch(e){console.warn("textNear失敗",q,e);return[];}
}
async function findPlace(q,center){
  const {Place}=await google.maps.importLibrary("places");
  try{
    const{places}=await Place.searchByText({
      textQuery:q, fields:["displayName","location"], maxResultCount:1, language:"ja", region:"jp",
      locationBias:{center:new google.maps.LatLng(center.lat,center.lng),radius:20000}
    });
    if(!places.length)return null;
    const p=places[0];
    return{name:p.displayName,lat:p.location.lat(),lng:p.location.lng()};
  }catch(e){console.warn("findPlace失敗",q,e);return null;}
}
function haversine(a,b){
  const R=6371000,t=Math.PI/180;
  const dl=(b.lat-a.lat)*t,dg=(b.lng-a.lng)*t;
  const x=Math.sin(dl/2)**2+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dg/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
async function walkDistances(origin,list){
  const {DistanceMatrixService}=await google.maps.importLibrary("routes");
  const svc=new DistanceMatrixService();
  const out=new Array(list.length).fill(null);
  for(let i=0;i<list.length;i+=25){
    const chunk=list.slice(i,i+25);
    try{
      const res=await svc.getDistanceMatrix({
        origins:[new google.maps.LatLng(origin.lat,origin.lng)],
        destinations:chunk.map(p=>new google.maps.LatLng(p.lat,p.lng)),
        travelMode:google.maps.TravelMode.WALKING,
        unitSystem:google.maps.UnitSystem.METRIC
      });
      res.rows[0].elements.forEach((el,j)=>{
        out[i+j]=(el.status==="OK")?el.distance.value:null;
      });
    }catch(e){console.warn("距離計算失敗",e);}
  }
  // 経路が取れなかった分は直線距離×1.25で補完
  return out.map((v,i)=>v!=null?{m:v,est:false}:{m:Math.round(haversine(origin,list[i])*1.25),est:true});
}


function project(lat,lng,z){
  const s=256*Math.pow(2,z);
  const sy=Math.sin(lat*Math.PI/180);
  return{x:(lng+180)/360*s, y:(0.5-Math.log((1+sy)/(1-sy))/(4*Math.PI))*s};
}

function unproject(x,y,z){
  const s=256*Math.pow(2,z);
  const n=Math.PI-2*Math.PI*y/s;
  return{lat:180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))), lng:x/s*360-180};
}

/* ══════════ 共通データの読み込み ══════════ */
// このファイルが置かれている場所を基準にする。
// 提案書ビルダーなど別リポジトリから /shuhen-chosa/shuhen-core.js を読んでも正しく動く。
const SHUHEN_BASE=(()=>{try{return document.currentScript.src.replace(/[^/]*$/,"");}catch(e){return "./";}})();
function loadToshi(){
  return fetch(SHUHEN_BASE+"toyama-toshi.json")
    .then(r=>r.ok?r.json():Promise.reject(new Error("toyama-toshi.json を読み込めません")))
    .then(d=>{TOSHI=d;return d;});
}

/* ══════════ 一括調査 ══════════ */
// 住所ひとつから、学区・都市計画・学校・周辺施設・駅・バス停をまとめて返す。
// opt: {key, pair:{e,m}, cats, onStep}
async function surveyAddress(addr,opt){
  opt=opt||{};
  const step=opt.onStep||function(){};
  await loadGoogle(opt.key);
  if(!TOSHI)await loadToshi().catch(()=>null);

  const gakku=lookupGakku(addr);
  step("住所を地図上で特定しています…");
  const o=await geocode(addr);

  const pair=opt.pair||(gakku.hits[0]?{e:gakku.hits[0].e,m:gakku.hits[0].m}:{e:"",m:""});
  const shoName=pair.e?"富山市立"+pair.e+"小学校":null;
  const chuName=pair.m?"富山市立"+pair.m+"中学校":null;

  step("学校と周辺施設を検索しています…");
  const [shoP,chuP]=await Promise.all([
    shoName?findPlace(shoName,o):Promise.resolve(null),
    chuName?findPlace(chuName,o):Promise.resolve(null)
  ]);

  const cats=opt.cats||CATS.filter(c=>c.on);
  const jobs=cats.map(async c=>{
    const res=await Promise.all([
      nearby(o,c.types,c.r,5),
      ...(c.text||[]).map(t=>textNear(t,o,c.r,5))
    ]);
    const seen=new Set(),out=[];
    for(const p of res.flat()){
      if(c.id==="youji"&&!YOUJI_OK.test(p.name))continue;
      const k=p.name+"|"+p.lat.toFixed(5);
      if(seen.has(k))continue;
      seen.add(k);out.push({...p,cat:c.id,catLabel:c.label});
    }
    return out.sort((a,b)=>haversine(o,a)-haversine(o,b)).slice(0,6);
  });
  const dedupe=(arr,drop)=>{
    const seen=new Set(),out=[];
    for(const p of arr){
      if(drop&&drop.test(p.name))continue;
      const k=p.name+"|"+p.lat.toFixed(5);
      if(seen.has(k))continue;
      seen.add(k);out.push(p);
    }
    return out.sort((a,b)=>haversine(o,a)-haversine(o,b)).slice(0,5);
  };
  const staJob=Promise.all([
    nearby(o,["train_station","subway_station","light_rail_station","transit_station"],4000,8),
    textNear("駅",o,3000,6)
  ]).then(r=>dedupe(r.flat(),/バス停|停留所|バスターミナル/));
  const busJob=Promise.all([
    nearby(o,["bus_stop","bus_station"],1500,8),
    textNear("バス停",o,1200,6)
  ]).then(r=>dedupe(r.flat()));

  const [catRes,stations,buses]=await Promise.all([Promise.all(jobs),staJob,busJob]);

  step("道路距離を計算しています…");
  const all=[];
  if(shoP)all.push({...shoP,cat:"sho",catLabel:"小学校",fixed:true});
  if(chuP)all.push({...chuP,cat:"chu",catLabel:"中学校",fixed:true});
  catRes.flat().forEach(p=>all.push(p));
  stations.forEach(p=>all.push({...p,cat:"_sta",catLabel:"駅"}));
  buses.forEach(p=>all.push({...p,cat:"_bus",catLabel:"バス停"}));
  const ds=await walkDistances(o,all);
  all.forEach((p,i)=>{p.m=ds[i].m;p.est=ds[i].est;p.mins=WALK(p.m);});

  const pick=c=>all.filter(p=>p.cat===c).sort((a,b)=>a.m-b.m);
  return {
    origin:o, gakku, pair,
    toshi:TOSHI?lookupToshi(o.lat,o.lng):null,
    sho:pick("sho")[0]||{name:shoName||"（未選択）",catLabel:"小学校",m:0,mins:0,missing:!!shoName},
    chu:pick("chu")[0]||{name:chuName||"（未選択）",catLabel:"中学校",m:0,mins:0,missing:!!chuName},
    facilities:all.filter(p=>!p.fixed&&p.cat[0]!=="_").sort((a,b)=>a.m-b.m),
    stations:pick("_sta"), buses:pick("_bus")
  };
}

/* ══════════ 地理院タイルの描画 ══════════ */
const MAXZ_GSI={pale:16,std:18};
const tileProbe={};
function probeTile(layer,z,lat,lng){
  const key=layer+"/"+z;
  if(key in tileProbe)return Promise.resolve(tileProbe[key]);
  const n=Math.pow(2,z),p=project(lat,lng,z);
  const tx=Math.floor(p.x/256),ty=Math.floor(p.y/256);
  return new Promise(res=>{
    const im=new Image();
    im.onload=()=>{tileProbe[key]=true;res(true);};
    im.onerror=()=>{tileProbe[key]=false;res(false);};
    im.src=`https://cyberjapandata.gsi.go.jp/xyz/${layer}/${z}/${((tx%n)+n)%n}/${ty}.png`;
  });
}
async function drawGsiTiles(ctx,center,z,W,H,layer){
  layer=layer||"pale";
  let tz=Math.min(z,MAXZ_GSI[layer]);
  if(z>tz&&await probeTile(layer,z,center.lat,center.lng))tz=z;
  const k=Math.pow(2,z-tz);
  ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  const c=project(center.lat,center.lng,tz),L=c.x-W/(2*k),T=c.y-H/(2*k);
  const n=Math.pow(2,tz),TS=256,jobs=[];
  for(let tx=Math.floor(L/TS);tx<=Math.floor((L+W/k)/TS);tx++){
    for(let ty=Math.floor(T/TS);ty<=Math.floor((T+H/k)/TS);ty++){
      if(ty<0||ty>=n)continue;
      const wx=((tx%n)+n)%n;
      jobs.push(new Promise(res=>{
        const im=new Image();im.crossOrigin="anonymous";
        im.onload=()=>{ctx.drawImage(im,(tx*TS-L)*k,(ty*TS-T)*k,TS*k,TS*k);res();};
        im.onerror=()=>res();
        im.src=`https://cyberjapandata.gsi.go.jp/xyz/${layer}/${tz}/${wx}/${ty}.png`;
      }));
    }
  }
  await Promise.all(jobs);
}
function gsiCredit(ctx,W,H,size){
  size=size||15;
  ctx.font=`bold ${size}px sans-serif`;ctx.textAlign="right";ctx.textBaseline="bottom";
  const t="出典：国土地理院ウェブサイト（地理院タイル）";
  const w=ctx.measureText(t).width;
  ctx.fillStyle="rgba(255,255,255,.88)";ctx.fillRect(W-w-14,H-size-11,w+12,size+7);
  ctx.fillStyle="#333";ctx.fillText(t,W-8,H-8);
}
function fitZoom(pts,W,H,margin){
  margin=margin||80;
  for(let z=18;z>=11;z--){
    const ps=pts.map(p=>project(p.lat,p.lng,z));
    const w=Math.max(...ps.map(p=>p.x))-Math.min(...ps.map(p=>p.x));
    const h=Math.max(...ps.map(p=>p.y))-Math.min(...ps.map(p=>p.y));
    if(w<W-margin&&h<H-margin)return z;
  }
  return 11;
}
function centerOf(pts,z){
  const ps=pts.map(p=>project(p.lat,p.lng,z));
  const cx=(Math.min(...ps.map(p=>p.x))+Math.max(...ps.map(p=>p.x)))/2;
  const cy=(Math.min(...ps.map(p=>p.y))+Math.max(...ps.map(p=>p.y)))/2;
  return unproject(cx,cy,z);
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}

/* ══════════ 施設名入りの地図（提案書向け） ══════════ */
// opt: {points:[{lat,lng,kind:"prop"|"fac",n,name}], w, h, zoom, layer, labels, pinR, fontSize}
// 戻り値: canvas（そのまま提案書に差し込める）
async function renderShuhenMap(opt){
  const W=opt.w||1400, H=opt.h||900;
  const pts=opt.points||[];
  const z=opt.zoom||fitZoom(pts,W,H,opt.labels===false?90:260);
  const center=opt.center||centerOf(pts,z);
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;
  const ctx=cv.getContext("2d");
  await drawGsiTiles(ctx,center,z,W,H,opt.layer||"pale");

  const c=project(center.lat,center.lng,z),L=c.x-W/2,T=c.y-H/2;
  const items=pts.map(p=>{const q=project(p.lat,p.lng,z);return{...p,x:q.x-L,y:q.y-T};})
                 .filter(p=>p.x>-30&&p.x<W+30&&p.y>-30&&p.y<H+30);

  if(opt.labels!==false){
    const fs=opt.fontSize||21;
    ctx.font=`bold ${fs}px "Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif`;
    const placed=[];
    for(const it of items){
      if(!it.name)continue;
      const label=(it.kind==="fac"&&it.n?it.n+". ":"")+it.name;
      const tw=ctx.measureText(label).width+16, th=fs+14;
      const cand=[[it.x+18,it.y-th/2],[it.x-18-tw,it.y-th/2],
                  [it.x-tw/2,it.y+20],[it.x-tw/2,it.y-20-th]];
      let box=null;
      for(const[bx,by]of cand){
        if(bx<3||by<3||bx+tw>W-3||by+th>H-3)continue;
        const r={x:bx,y:by,w:tw,h:th};
        if(placed.some(q=>!(r.x+r.w<q.x||q.x+q.w<r.x||r.y+r.h<q.y||q.y+q.h<r.y)))continue;
        box=r;break;
      }
      if(!box)continue;                       // 置けないものは省く
      placed.push(box);
      const prop=it.kind==="prop";
      ctx.fillStyle="rgba(255,255,255,.94)";
      ctx.strokeStyle=prop?"#C62828":"#0F2A4D";ctx.lineWidth=prop?2.5:1.6;
      roundRect(ctx,box.x,box.y,box.w,box.h,6);ctx.fill();ctx.stroke();
      ctx.fillStyle=prop?"#C62828":"#16222F";
      ctx.textAlign="left";ctx.textBaseline="middle";
      ctx.fillText(label,box.x+8,box.y+th/2);
    }
  }
  for(const it of items){
    const prop=it.kind==="prop", r=opt.pinR||(prop?13:11);
    ctx.beginPath();ctx.arc(it.x,it.y,r+3.5,0,7);ctx.fillStyle="#fff";ctx.fill();
    ctx.beginPath();ctx.arc(it.x,it.y,r,0,7);ctx.fillStyle=prop?"#C62828":"#E8730C";ctx.fill();
    if(prop){ctx.beginPath();ctx.arc(it.x,it.y,4.5,0,7);ctx.fillStyle="#fff";ctx.fill();}
    else if(it.n!=null){
      ctx.fillStyle="#fff";ctx.font=`bold ${Math.round(r*1.35)}px sans-serif`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(String(it.n),it.x,it.y+.5);
    }
  }
  gsiCredit(ctx,W,H,Math.max(14,Math.round(W/70)));
  return cv;
}
