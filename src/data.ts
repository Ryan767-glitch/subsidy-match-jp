export type PurposeKey =
  | 'dx-ai'
  | 'labor-saving'
  | 'marketing'
  | 'new-business'
  | 'inheritance'
  | 'startup'

export type EmployeeBand = 'startup' | '1-5' | '6-20' | '21-50' | '51+'
export type BudgetBand = '<100' | '100-500' | '500-1000' | '1000+'

export type Grant = {
  id: string
  name: string
  operator: string
  summary: string
  statusHint?: 'upcoming' | 'open'
  subsidyRange: string
  subsidyRate: string
  applicationWindow: {
    opensAt?: string
    closesAt?: string
    openLabel: string
    closeLabel: string
    windowLabel: string
  }
  purposeKeys: PurposeKey[]
  tags: string[]
  recommendedEmployeeBands: EmployeeBand[]
  budgetBands: BudgetBand[]
  availableIn: string[]
  keyCaution: string
  officialUrl: string
  sourceUrl: string
  verifiedAt: string
  matchReasonByPurpose: Partial<Record<PurposeKey, string>>
}

export const purposeOptions: Array<{ key: PurposeKey; label: string; caption: string }> = [
  { key: 'dx-ai', label: 'IT / DX / AI', caption: 'ソフト、クラウド、AI活用' },
  { key: 'labor-saving', label: '省力化設備', caption: 'ロボット、設備、現場改善' },
  { key: 'marketing', label: '販路開拓', caption: '広告、展示会、Web集客' },
  { key: 'new-business', label: '新規事業', caption: '新市場、新商品、新サービス' },
  { key: 'inheritance', label: '承継 / M&A', caption: '事業承継、PMI、専門家費用' },
  { key: 'startup', label: '創業初期', caption: '創業前後の立ち上げ' },
]

export const grants: Grant[] = [
  {
    id: 'digital-ai-2026',
    name: 'デジタル化・AI導入補助金2026',
    operator: '中小企業庁 / 中小機構',
    summary:
      'AIを含むITツールの導入で、生産性向上や業務効率化を進めたい中小企業向け。通常枠ではソフトウェア購入費・クラウド利用費・導入関連費が対象です。',
    subsidyRange: '5万円〜450万円以下',
    subsidyRate: '1/2以内（最低賃金近傍事業者は2/3以内）',
    applicationWindow: {
      opensAt: '2026-03-30T00:00:00+09:00',
      openLabel: '2026年3月30日',
      closeLabel: '締切は事務局公表待ち',
      windowLabel: '2026年3月30日〜（締切は事務局公表待ち）',
    },
    purposeKeys: ['dx-ai'],
    tags: ['IT導入', 'AI活用', 'DX', 'クラウド'],
    recommendedEmployeeBands: ['1-5', '6-20', '21-50', '51+'],
    budgetBands: ['<100', '100-500'],
    availableIn: ['全国'],
    keyCaution:
      '導入できるのは事務局に登録されたITツールに限られます。プロセス数の要件や最低賃金近傍事業者の定義は公募要領で確認が必要です。',
    officialUrl: 'https://www.chusho.meti.go.jp/koukai/hojyokin/kobo/2026/260310001.html',
    sourceUrl: 'https://it-shien.smrj.go.jp/pdf/it2026_kitei_tsujyo.pdf',
    verifiedAt: '2026年3月26日',
    matchReasonByPurpose: {
      'dx-ai': 'AI・クラウド・業務ソフトの導入を直接支援する代表的な制度です。',
    },
  },
  {
    id: 'monodukuri-23',
    name: 'ものづくり補助金 第23次',
    operator: '全国中小企業団体中央会',
    summary:
      '革新的な新製品・新サービス開発や海外需要開拓のための設備投資向け。単なる機械更新ではなく、付加価値向上を伴う事業計画が前提です。',
    subsidyRange: '750万円〜2,500万円（グローバル枠は3,000万円）',
    subsidyRate: '中小企業1/2、小規模・再生事業者2/3',
    applicationWindow: {
      opensAt: '2026-04-03T17:00:00+09:00',
      closesAt: '2026-05-08T17:00:00+09:00',
      openLabel: '2026年4月3日 17:00',
      closeLabel: '2026年5月8日 17:00',
      windowLabel: '2026年4月3日 17:00〜2026年5月8日 17:00',
    },
    purposeKeys: ['new-business', 'labor-saving'],
    tags: ['新製品開発', '設備投資', 'グローバル展開'],
    recommendedEmployeeBands: ['6-20', '21-50', '51+'],
    budgetBands: ['500-1000', '1000+'],
    availableIn: ['全国'],
    keyCaution:
      '単に設備を入れるだけでは対象外です。新製品・新サービス開発の新規性や市場性を事業計画で説明する必要があります。',
    officialUrl: 'https://portal.monodukuri-hojo.jp/',
    sourceUrl:
      'https://portal.monodukuri-hojo.jp/common/bunsho/ippan/23th/%E5%85%AC%E5%8B%9F%E8%A6%81%E9%A0%98%E6%A6%82%E8%A6%81%E7%89%88_23%E6%AC%A1%E7%B7%A0%E5%88%87_20260209.pdf',
    verifiedAt: '2026年3月26日',
    matchReasonByPurpose: {
      'new-business': '新商品・新サービス開発を伴う大型投資に向いています。',
      'labor-saving': '省力化設備でも、新規価値の創出を説明できるなら有力候補です。',
    },
  },
  {
    id: 'jizokuka-19',
    name: '小規模事業者持続化補助金＜一般型・通常枠＞ 第19回',
    operator: '中小企業庁',
    summary:
      '小規模事業者の販路開拓や、その取組と併せた業務効率化を支援。広告、ウェブサイト関連費、展示会出展、新商品開発などに使いやすい制度です。',
    subsidyRange: '上限50万円（特例で最大250万円）',
    subsidyRate: '2/3（賃金引上げ特例のうち赤字事業者は3/4）',
    applicationWindow: {
      opensAt: '2026-03-06T00:00:00+09:00',
      closesAt: '2026-04-30T17:00:00+09:00',
      openLabel: '2026年3月6日',
      closeLabel: '2026年4月30日 17:00',
      windowLabel: '2026年3月6日〜2026年4月30日 17:00',
    },
    purposeKeys: ['marketing'],
    tags: ['販路開拓', 'Webサイト', '展示会', '小規模事業者'],
    recommendedEmployeeBands: ['startup', '1-5', '6-20'],
    budgetBands: ['<100', '100-500'],
    availableIn: ['全国'],
    keyCaution:
      '小規模事業者の定義は業種ごとに異なります。申請には商工会または商工会議所の支援と様式4の取得が必要です。',
    officialUrl: 'https://www.chusho.meti.go.jp/koukai/hojyokin/kobo/2026/260128002.html',
    sourceUrl: 'https://r6.jizokukahojokin.info/doc/r6_koubover6_ip19.pdf',
    verifiedAt: '2026年3月26日',
    matchReasonByPurpose: {
      marketing: '広告・展示会・サイト改善など、販路開拓に直接使いやすい制度です。',
    },
  },
  {
    id: 'sogyo-3',
    name: '小規模事業者持続化補助金＜創業型＞ 第3回',
    operator: '中小企業庁',
    summary:
      '創業前後の小規模事業者向け。持続的な経営計画に基づく販路開拓や立ち上げ施策を支援する、初期フェーズ向けの持続化補助金です。',
    subsidyRange: '上限200万円（インボイス特例で最大250万円）',
    subsidyRate: '2/3以内',
    applicationWindow: {
      opensAt: '2026-03-06T00:00:00+09:00',
      closesAt: '2026-04-30T17:00:00+09:00',
      openLabel: '2026年3月6日',
      closeLabel: '2026年4月30日 17:00',
      windowLabel: '2026年3月6日〜2026年4月30日 17:00',
    },
    purposeKeys: ['startup', 'marketing'],
    tags: ['創業', '販路開拓', '初期投資'],
    recommendedEmployeeBands: ['startup', '1-5'],
    budgetBands: ['<100', '100-500'],
    availableIn: ['全国'],
    keyCaution:
      '創業後1年以内が基本対象です。認定市区町村による特定創業支援等事業など、事務局指定の要件確認が必要です。',
    officialUrl: 'https://www.chusho.meti.go.jp/koukai/hojyokin/kobo/2026/260128001.html',
    sourceUrl: 'https://www.chusho.meti.go.jp/koukai/yosan/r7/r6_jizoku_sougyo.pdf',
    verifiedAt: '2026年3月26日',
    matchReasonByPurpose: {
      startup: '創業期向けに設計されており、立ち上げ直後の販路開拓資金に相性が高い制度です。',
      marketing: '創業初期の集客・販促に使いやすい枠です。',
    },
  },
  {
    id: 'shinjigyou-3',
    name: '新事業進出補助金 第3回',
    operator: '中小企業庁 / 中小機構',
    summary:
      '既存事業と異なる事業への前向きな挑戦を支援。設備、システム、建物、広告宣伝まで含む大型投資向けで、新市場進出の本命候補です。',
    subsidyRange: '750万円〜7,000万円（賃上げ特例で最大9,000万円）',
    subsidyRate: '1/2',
    applicationWindow: {
      opensAt: '2026-02-17T00:00:00+09:00',
      closesAt: '2026-03-26T18:00:00+09:00',
      openLabel: '2026年2月17日',
      closeLabel: '2026年3月26日 18:00',
      windowLabel: '2026年2月17日〜2026年3月26日 18:00',
    },
    purposeKeys: ['new-business'],
    tags: ['新市場進出', '建物費', 'システム構築', '大型投資'],
    recommendedEmployeeBands: ['6-20', '21-50', '51+'],
    budgetBands: ['500-1000', '1000+'],
    availableIn: ['全国'],
    keyCaution:
      '新規性は「自社にとって新しい製品等」と「自社にとって新しい市場」の両方で見られます。既存事業の延長だと通りにくい制度です。',
    officialUrl: 'https://shinjigyou-shinshutsu.smrj.go.jp/',
    sourceUrl: 'https://shinjigyou-shinshutsu.smrj.go.jp/docs/shinjigyou_koubo_3.pdf',
    verifiedAt: '2026年3月26日',
    matchReasonByPurpose: {
      'new-business': '既存事業と異なる新市場への進出を支援する制度で、用途の一致度が高いです。',
    },
  },
  {
    id: 'shokei-ma-14',
    name: '事業承継・M&A補助金 十四次公募',
    operator: '中小企業庁',
    summary:
      '事業承継やM&Aの局面で必要になる設備投資、FA・仲介費用、DD、PMI、廃業再チャレンジ費用まで支援。承継を具体的に進める企業向けです。',
    subsidyRange: '枠により150万円〜2,000万円',
    subsidyRate: '1/3〜2/3（枠により異なる）',
    applicationWindow: {
      opensAt: '2026-02-27T00:00:00+09:00',
      closesAt: '2026-04-03T17:00:00+09:00',
      openLabel: '2026年2月27日',
      closeLabel: '2026年4月3日 17:00',
      windowLabel: '2026年2月27日〜2026年4月3日 17:00予定',
    },
    purposeKeys: ['inheritance'],
    tags: ['事業承継', 'M&A', 'PMI', '専門家費用'],
    recommendedEmployeeBands: ['1-5', '6-20', '21-50', '51+'],
    budgetBands: ['100-500', '500-1000', '1000+'],
    availableIn: ['全国'],
    keyCaution:
      'どの枠に入るかで補助率・上限が大きく変わります。承継予定か、M&A着手中か、PMI段階かを整理してから枠を決める必要があります。',
    officialUrl: 'https://www.chusho.meti.go.jp/koukai/hojyokin/kobo/2026/260130001.html',
    sourceUrl: 'https://www.chusho.meti.go.jp/koukai/hojyokin/kobo/2026/260130001.html',
    verifiedAt: '2026年3月26日',
    matchReasonByPurpose: {
      inheritance: '承継・M&A・PMI・廃業再挑戦まで一連で見られる制度です。',
    },
  },
  {
    id: 'shoryokuka-catalog',
    name: '中小企業省力化投資補助金 カタログ注文型',
    operator: '中小機構',
    summary:
      'カタログに登録された汎用製品から選んで導入できる省力化制度。レジ、券売機、清掃ロボットなど、比較的早く導入したい企業向けです。',
    subsidyRange: '200万円〜1,000万円（賃上げで最大1,500万円）',
    subsidyRate: '1/2以下',
    applicationWindow: {
      opensAt: '2026-03-13T00:00:00+09:00',
      openLabel: '2026年3月13日',
      closeLabel: '2026年5月中旬予定',
      windowLabel: '2026年3月13日〜2026年5月中旬予定',
    },
    purposeKeys: ['labor-saving'],
    tags: ['カタログ型', '省力化', '汎用製品', '人手不足対策'],
    recommendedEmployeeBands: ['1-5', '6-20', '21-50'],
    budgetBands: ['100-500', '500-1000'],
    availableIn: ['全国'],
    keyCaution:
      '2026年3月19日に制度改定が入り、従業員5名以下の補助上限額が変更されました。申請時点の制度条件で再確認が必要です。',
    officialUrl: 'https://shoryokuka.smrj.go.jp/catalog/about/',
    sourceUrl: 'https://shoryokuka.smrj.go.jp/catalog/about/',
    verifiedAt: '2026年3月26日',
    matchReasonByPurpose: {
      'labor-saving': 'カタログから選ぶ方式なので、汎用設備の省力化に最も使いやすい制度です。',
    },
  },
  {
    id: 'shoryokuka-general',
    name: '中小企業省力化投資補助金 一般型 第6回',
    operator: '中小機構',
    summary:
      '個別現場に合わせたオーダーメイド設備やシステム構築向け。IoT、AI、ロボット、センサーを使った本格的な省力化投資に向きます。',
    statusHint: 'upcoming',
    subsidyRange: '750万円〜1億円',
    subsidyRate: '中小企業1/2、小規模・再生事業者2/3（一部1/3あり）',
    applicationWindow: {
      openLabel: '2026年4月中旬予定',
      closeLabel: '第6回公募関連資料公開済み',
      windowLabel: '申請ポータル受付は2026年4月中旬予定',
    },
    purposeKeys: ['labor-saving', 'dx-ai'],
    tags: ['一般型', 'オーダーメイド設備', 'ロボット', 'IoT'],
    recommendedEmployeeBands: ['6-20', '21-50', '51+'],
    budgetBands: ['500-1000', '1000+'],
    availableIn: ['全国'],
    keyCaution:
      '一般型は省力化指数を示した事業計画が必要です。カタログ型と違って、設備の個別設計やSIer連携の説明が求められます。',
    officialUrl: 'https://shoryokuka.smrj.go.jp/',
    sourceUrl: 'https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_02.pdf',
    verifiedAt: '2026年3月26日',
    matchReasonByPurpose: {
      'labor-saving': '個別現場向けの大型省力化に使える本格制度です。',
      'dx-ai': 'AI・IoT・ロボットを使った現場改善なら、この枠の方が適合しやすいです。',
    },
  },
]

export const regionalSupportLinks: Array<{
  prefectures: string[]
  name: string
  operator: string
  description: string
  url: string
}> = [
  {
    prefectures: ['全国'],
    name: '補助金公募情報',
    operator: '中小企業庁',
    description: '中小企業庁の最新公募一覧。まず国の募集が更新されていないかを確認する起点に使います。',
    url: 'https://www.chusho.meti.go.jp/koukai/hojyokin/kobo.html',
  },
  {
    prefectures: ['全国'],
    name: 'よろず支援拠点',
    operator: '中小機構',
    description: '無料で経営相談できる国の窓口。補助金選定だけでなく、計画書の方向性整理にも使えます。',
    url: 'https://yorozu.smrj.go.jp/',
  },
  {
    prefectures: ['全国'],
    name: '全国各地の商工会WEBサーチ',
    operator: '全国商工会連合会',
    description: '持続化補助金や創業支援で必要になる地元商工会を探すための公式検索です。',
    url: 'https://www.shokokai.or.jp/?page_id=1754',
  },
  {
    prefectures: ['東京都'],
    name: '東京都中小企業振興公社 助成金',
    operator: '東京都中小企業振興公社',
    description: '東京都内事業者向けの助成金一覧。国の制度に加えて都独自の設備・販路・事業承継系助成を確認できます。',
    url: 'https://www.tokyo-kosha.or.jp/support/josei/index.html',
  },
  {
    prefectures: ['大阪府'],
    name: '大阪府 中小企業支援室',
    operator: '大阪府',
    description: '大阪府の中小企業向け支援施策の総合窓口。事業承継、創業、新事業、ものづくり関連の支援情報に到達できます。',
    url: 'https://www.pref.osaka.lg.jp/soshikikarasagasu/s_shokoshinko/index.html',
  },
  {
    prefectures: ['福岡県'],
    name: '福岡市 中小企業の設備投資を支援します',
    operator: '福岡市',
    description: '福岡市内事業者向けの設備投資支援案内。地域限定の投資支援を探す際の入口として使えます。',
    url: 'https://www.city.fukuoka.lg.jp/shicho/koho/fsdweb/2024/0501/1008.html',
  },
]

export const prefectures = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
]
