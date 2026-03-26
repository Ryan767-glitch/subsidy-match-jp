import { useState } from 'react'
import './App.css'
import {
  grants,
  prefectures,
  purposeOptions,
  regionalSupportLinks,
  type BudgetBand,
  type EmployeeBand,
  type Grant,
  type PurposeKey,
} from './data'

type UrgencyMode = 'open-now' | 'include-upcoming'
type OccupationKey =
  | 'employee-sidebiz'
  | 'freelancer'
  | 'small-owner'
  | 'business-owner'
  | 'growth-ceo'
  | 'successor'
type IncomeKey = '<300' | '300-700' | '700-1200' | '1200+'

type Answers = {
  purpose: PurposeKey
  employeeBand: EmployeeBand
  budgetBand: BudgetBand
  prefecture: string
  urgency: UrgencyMode
}

type GrantStatus = {
  label: string
  tone: 'open' | 'upcoming' | 'closing' | 'closed'
  detail: string
}

const todayInJst = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date())

const defaultAnswers: Answers = {
  purpose: 'dx-ai',
  employeeBand: '6-20',
  budgetBand: '100-500',
  prefecture: '東京都',
  urgency: 'include-upcoming',
}

const defaultOccupation: OccupationKey = 'business-owner'
const defaultIncome: IncomeKey = '300-700'

const occupationOptions: Array<{
  key: OccupationKey
  label: string
  caption: string
  recommendedPurpose: PurposeKey
  employeeBand: EmployeeBand
}> = [
  {
    key: 'employee-sidebiz',
    label: '会社員・副業検討',
    caption: 'まずは創業準備や小さな販促から',
    recommendedPurpose: 'startup',
    employeeBand: 'startup',
  },
  {
    key: 'freelancer',
    label: '個人事業主・フリーランス',
    caption: '販路開拓やIT導入を優先',
    recommendedPurpose: 'marketing',
    employeeBand: '1-5',
  },
  {
    key: 'small-owner',
    label: '小規模法人の代表',
    caption: '広告・サイト改善・小規模投資向け',
    recommendedPurpose: 'marketing',
    employeeBand: '1-5',
  },
  {
    key: 'business-owner',
    label: '中小企業の経営者',
    caption: 'DXや設備投資の候補を優先',
    recommendedPurpose: 'dx-ai',
    employeeBand: '6-20',
  },
  {
    key: 'growth-ceo',
    label: '成長企業の経営者',
    caption: '大型投資や新規事業向け',
    recommendedPurpose: 'labor-saving',
    employeeBand: '21-50',
  },
  {
    key: 'successor',
    label: '事業承継を検討中',
    caption: '承継・M&A・PMIの候補へ',
    recommendedPurpose: 'inheritance',
    employeeBand: '6-20',
  },
]

const incomeOptions: Array<{ key: IncomeKey; label: string; caption: string }> = [
  { key: '<300', label: '300万円未満', caption: 'まずは小さく試したい' },
  { key: '300-700', label: '300〜700万円', caption: '小規模投資なら動ける' },
  { key: '700-1200', label: '700〜1,200万円', caption: 'IT・広告・設備を検討' },
  { key: '1200+', label: '1,200万円以上', caption: '中規模以上の投資も視野' },
]

const employeeLabels: Record<EmployeeBand, string> = {
  startup: '創業前〜創業1年以内',
  '1-5': '1〜5人',
  '6-20': '6〜20人',
  '21-50': '21〜50人',
  '51+': '51人以上',
}

const budgetLabels: Record<BudgetBand, string> = {
  '<100': '100万円未満',
  '100-500': '100〜500万円',
  '500-1000': '500〜1,000万円',
  '1000+': '1,000万円超',
}

function getGrantStatus(grant: Grant): GrantStatus {
  const now = new Date()
  const opensAt = grant.applicationWindow.opensAt ? new Date(grant.applicationWindow.opensAt) : null
  const closesAt = grant.applicationWindow.closesAt ? new Date(grant.applicationWindow.closesAt) : null

  if (grant.statusHint === 'upcoming' && !opensAt) {
    return {
      label: '受付前',
      tone: 'upcoming',
      detail: `受付開始: ${grant.applicationWindow.openLabel}`,
    }
  }

  if (closesAt && now > closesAt) {
    return {
      label: '締切済み',
      tone: 'closed',
      detail: `締切: ${grant.applicationWindow.closeLabel}`,
    }
  }

  if (opensAt && now < opensAt) {
    return {
      label: '受付前',
      tone: 'upcoming',
      detail: `受付開始: ${grant.applicationWindow.openLabel}`,
    }
  }

  if (closesAt) {
    const closingSoon = closesAt.getTime() - now.getTime()
    const oneDayMs = 24 * 60 * 60 * 1000

    if (closingSoon <= oneDayMs) {
      return {
        label: '本日締切',
        tone: 'closing',
        detail: `締切: ${grant.applicationWindow.closeLabel}`,
      }
    }

    return {
      label: '受付中',
      tone: 'open',
      detail: `締切: ${grant.applicationWindow.closeLabel}`,
    }
  }

  return {
    label: '公開中',
    tone: 'open',
    detail: grant.applicationWindow.closeLabel,
  }
}

function scoreGrant(grant: Grant, answers: Answers) {
  const reasons: string[] = []
  let score = 0

  if (grant.purposeKeys.includes(answers.purpose)) {
    score += 42
    reasons.push(grant.matchReasonByPurpose[answers.purpose] ?? '希望する用途と親和性があります。')
  }

  if (grant.recommendedEmployeeBands.includes(answers.employeeBand)) {
    score += 22
    reasons.push(`${employeeLabels[answers.employeeBand]}の事業者向けに相性が高い募集です。`)
  }

  if (grant.budgetBands.includes(answers.budgetBand)) {
    score += 16
    reasons.push(`想定投資規模 ${budgetLabels[answers.budgetBand]} に近い補助上限です。`)
  }

  if (grant.availableIn.includes('全国') || grant.availableIn.includes(answers.prefecture)) {
    score += 10
    reasons.push(grant.availableIn.includes('全国') ? '全国から申請対象を確認できます。' : `${answers.prefecture} で使える制度です。`)
  }

  if (answers.urgency === 'open-now') {
    const status = getGrantStatus(grant)

    if (status.tone === 'upcoming') {
      score -= 28
    }

    if (status.tone === 'closed') {
      score = -999
    }
  }

  if (grant.keyCaution.toLowerCase().includes('小規模事業者') && answers.employeeBand === '51+') {
    score -= 12
  }

  return { score, reasons }
}

function filterRegionalLinks(prefecture: string) {
  return regionalSupportLinks.filter((link) => link.prefectures.includes('全国') || link.prefectures.includes(prefecture))
}

function buildPreset(occupation: OccupationKey, income: IncomeKey): Pick<Answers, 'purpose' | 'employeeBand' | 'budgetBand'> {
  const occupationConfig = occupationOptions.find((option) => option.key === occupation)

  let budgetBand: BudgetBand = '100-500'

  if (income === '<300') budgetBand = '<100'
  if (income === '300-700') budgetBand = '100-500'
  if (income === '700-1200') budgetBand = occupation === 'growth-ceo' ? '500-1000' : '100-500'
  if (income === '1200+') budgetBand = occupation === 'growth-ceo' ? '1000+' : '500-1000'

  return {
    purpose: occupationConfig?.recommendedPurpose ?? 'dx-ai',
    employeeBand: occupationConfig?.employeeBand ?? '6-20',
    budgetBand,
  }
}

function App() {
  const [occupation, setOccupation] = useState(defaultOccupation)
  const [incomeBand, setIncomeBand] = useState(defaultIncome)
  const [answers, setAnswers] = useState(defaultAnswers)

  const rankedGrants = grants
    .map((grant) => {
      const ranking = scoreGrant(grant, answers)
      return {
        grant,
        reasons: ranking.reasons.slice(0, 3),
        score: ranking.score,
        status: getGrantStatus(grant),
      }
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)

  const featuredGrant = rankedGrants[0]
  const listGrants = featuredGrant ? rankedGrants.slice(1) : rankedGrants
  const regionalLinks = filterRegionalLinks(answers.prefecture)
  const openCount = rankedGrants.filter((item) => item.status.tone === 'open' || item.status.tone === 'closing').length
  const upcomingCount = rankedGrants.filter((item) => item.status.tone === 'upcoming').length
  const purposeCounts = purposeOptions.map((option) => ({
    ...option,
    count: grants.filter((grant) => grant.purposeKeys.includes(option.key)).length,
  }))
  const activePurpose = purposeOptions.find((option) => option.key === answers.purpose)
  const activeOccupation = occupationOptions.find((option) => option.key === occupation)

  const applyPreset = (nextOccupation: OccupationKey, nextIncome: IncomeKey, includePurpose = true) => {
    const preset = buildPreset(nextOccupation, nextIncome)
    setAnswers((current) => ({
      ...current,
      employeeBand: preset.employeeBand,
      budgetBand: preset.budgetBand,
      purpose: includePurpose ? preset.purpose : current.purpose,
    }))
  }

  return (
    <div className="portal-shell">
      <header className="topbar">
        <a className="brandmark" href="#top">
          <span className="brand-icon">JP</span>
          <span>
            <strong>Subsidy Match JP</strong>
            <small>中小企業向け補助金ポータル</small>
          </span>
        </a>

        <nav className="topnav" aria-label="主要導線">
          <a href="#search-panel">補助金を探す</a>
          <a href="#result-panel">おすすめ候補</a>
          <a href="#regional-support">地域窓口</a>
          <a href="#methodology">掲載ポリシー</a>
        </nav>

        <div className="top-actions">
          <a className="ghost-action" href="#methodology">
            情報の見方
          </a>
          <a className="solid-action" href="#search-panel">
            条件で絞り込む
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero-stage">
          <div className="hero-main">
            <div className="hero-badge">公式ソース確認済みの主要制度を掲載</div>
            <h1>補助金を、条件から迷わず見つける。</h1>
            <p className="hero-copy">
              参考サイトのようなポータル体験を意識しつつ、国の主要制度を中小企業向けに整理しました。
              ただ並べるのではなく、用途・従業員規模・投資規模・所在地から候補を絞り、各制度の
              申請期間と注意点まで一画面で判断できます。
            </p>

            <div className="hero-cta-row">
              <a className="solid-action large" href="#search-panel">
                今の条件で探す
              </a>
              <a className="ghost-action large" href="#methodology">
                掲載基準を見る
              </a>
            </div>

            <div className="hero-stat-orbs">
              <article>
                <strong>{grants.length}</strong>
                <span>主要制度</span>
                <small>2026年3月26日時点で確認</small>
              </article>
              <article>
                <strong>{openCount}</strong>
                <span>受付中</span>
                <small>今日時点で動ける候補</small>
              </article>
              <article>
                <strong>{upcomingCount}</strong>
                <span>受付前</span>
                <small>次に備える候補</small>
              </article>
            </div>
          </div>

          <aside className="hero-side">
            <article className="hero-note featured">
              <p className="mini-label">本日の注目</p>
              {featuredGrant ? (
                <>
                  <div className={`status-pill ${featuredGrant.status.tone}`}>{featuredGrant.status.label}</div>
                  <h2>{featuredGrant.grant.name}</h2>
                  <p>{featuredGrant.grant.summary}</p>
                  <dl>
                    <div>
                      <dt>補助額</dt>
                      <dd>{featuredGrant.grant.subsidyRange}</dd>
                    </div>
                    <div>
                      <dt>締切感</dt>
                      <dd>{featuredGrant.status.detail}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <>
                  <h2>候補を準備中</h2>
                  <p>絞り込み条件を少し広げると、マッチする制度候補が表示されます。</p>
                </>
              )}
            </article>

            <article className="hero-note">
              <p className="mini-label">精度ポリシー</p>
              <ul>
                <li>補助額・補助率・申請期間は公式ページ起点で確認</li>
                <li>各カードに最終確認日と根拠ソースを表示</li>
                <li>自治体制度はまず公式窓口導線を優先して誤掲載を抑制</li>
              </ul>
            </article>
          </aside>
        </section>

        <section className="search-panel" id="search-panel">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Easy Finder</p>
              <h2>職業と年収から、まず候補を見る</h2>
            </div>
            <div className="search-tabs" aria-label="検索タブ">
              <button type="button" className="search-tab active">
                かんたん診断
              </button>
              <button type="button" className="search-tab" disabled>
                詳細検索
              </button>
            </div>
          </div>

          <div className="search-layout">
            <div className="search-fields">
              <section className="field-block">
                <label>Step 1: あなたの立場に近いものを選択</label>
                <div className="simple-grid">
                  {occupationOptions.map((option) => (
                    <button
                      type="button"
                      key={option.key}
                      className={occupation === option.key ? 'simple-card active' : 'simple-card'}
                      onClick={() => {
                        setOccupation(option.key)
                        applyPreset(option.key, incomeBand, true)
                      }}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.caption}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="field-block">
                <label>Step 2: 年収の目安を選択</label>
                <div className="income-grid">
                  {incomeOptions.map((option) => (
                    <button
                      type="button"
                      key={option.key}
                      className={incomeBand === option.key ? 'simple-card active income' : 'simple-card income'}
                      onClick={() => {
                        setIncomeBand(option.key)
                        applyPreset(occupation, option.key, false)
                      }}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.caption}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="field-block">
                <label>Step 3: 何に使いたいかを選択</label>
                <div className="purpose-grid">
                  {purposeCounts.map((option) => (
                    <button
                      type="button"
                      key={option.key}
                      className={answers.purpose === option.key ? 'purpose-card active' : 'purpose-card'}
                      onClick={() => setAnswers((current) => ({ ...current, purpose: option.key }))}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.caption}</span>
                      <small>{option.count}制度</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className="field-block advanced-block">
                <label>詳細条件を調整したい場合</label>
                <p className="advanced-copy">
                  かんたん診断で自動セットされた条件を、必要なら下で細かく変更できます。
                </p>
              </section>

              <div className="field-row">
                <section className="field-block">
                  <label>従業員規模</label>
                  <div className="segmented-row">
                    {Object.entries(employeeLabels).map(([key, label]) => (
                      <button
                        type="button"
                        key={key}
                        className={answers.employeeBand === key ? 'choice-chip active' : 'choice-chip'}
                        onClick={() => setAnswers((current) => ({ ...current, employeeBand: key as EmployeeBand }))}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="field-block">
                  <label>投資規模</label>
                  <div className="segmented-row">
                    {Object.entries(budgetLabels).map(([key, label]) => (
                      <button
                        type="button"
                        key={key}
                        className={answers.budgetBand === key ? 'choice-chip active' : 'choice-chip'}
                        onClick={() => setAnswers((current) => ({ ...current, budgetBand: key as BudgetBand }))}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="field-row compact">
                <section className="field-block">
                  <label htmlFor="prefecture">所在地</label>
                  <select
                    id="prefecture"
                    value={answers.prefecture}
                    onChange={(event) => setAnswers((current) => ({ ...current, prefecture: event.target.value }))}
                  >
                    {prefectures.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </select>
                </section>

                <section className="field-block">
                  <label>公募ステータス</label>
                  <div className="segmented-row">
                    <button
                      type="button"
                      className={answers.urgency === 'open-now' ? 'choice-chip active' : 'choice-chip'}
                      onClick={() => setAnswers((current) => ({ ...current, urgency: 'open-now' }))}
                    >
                      受付中を優先
                    </button>
                    <button
                      type="button"
                      className={answers.urgency === 'include-upcoming' ? 'choice-chip active' : 'choice-chip'}
                      onClick={() => setAnswers((current) => ({ ...current, urgency: 'include-upcoming' }))}
                    >
                      受付前も含める
                    </button>
                  </div>
                </section>
              </div>
            </div>

            <aside className="search-summary">
              <p className="mini-label">かんたん診断の結果</p>
              <h3>{activeOccupation?.label}</h3>
              <ul className="summary-list">
                <li>年収目安: {incomeOptions.find((option) => option.key === incomeBand)?.label}</li>
                <li>自動設定された用途: {activePurpose?.label}</li>
                <li>従業員規模: {employeeLabels[answers.employeeBand]}</li>
                <li>投資規模: {budgetLabels[answers.budgetBand]}</li>
                <li>所在地: {answers.prefecture}</li>
                <li>表示条件: {answers.urgency === 'open-now' ? '受付中を優先' : '受付前も含める'}</li>
              </ul>

              <div className="summary-result">
                <strong>{rankedGrants.length}</strong>
                <span>件の候補</span>
                <small>{todayInJst} 時点の表示結果</small>
              </div>

              <p className="summary-caption">
                職業と年収は厳密な申請要件ではなく、候補を探しやすくするための入口です。最終判断は各カードの注意点と公式要領で確認してください。
              </p>

              <a className="solid-action large summary-jump" href="#result-panel">
                おすすめ候補へ移動
              </a>
            </aside>
          </div>
        </section>

        <section className="result-panel" id="result-panel">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Recommended</p>
              <h2>おすすめ候補</h2>
            </div>
            <div className="result-metrics">
              <span>受付中 {openCount}件</span>
              <span>受付前 {upcomingCount}件</span>
              <span>最終確認 {todayInJst}</span>
            </div>
          </div>

          {featuredGrant ? (
            <article className="featured-result">
              <div className="featured-result-main">
                <div className="featured-heading">
                  <div className={`status-pill ${featuredGrant.status.tone}`}>{featuredGrant.status.label}</div>
                  <span>{featuredGrant.grant.operator}</span>
                </div>
                <h3>{featuredGrant.grant.name}</h3>
                <p>{featuredGrant.grant.summary}</p>
                <div className="featured-reasons">
                  {featuredGrant.reasons.map((reason) => (
                    <span key={reason}>{reason}</span>
                  ))}
                </div>
              </div>

              <div className="featured-result-side">
                <div>
                  <small>補助額</small>
                  <strong>{featuredGrant.grant.subsidyRange}</strong>
                </div>
                <div>
                  <small>補助率</small>
                  <strong>{featuredGrant.grant.subsidyRate}</strong>
                </div>
                <div>
                  <small>申請期間</small>
                  <strong>{featuredGrant.grant.applicationWindow.windowLabel}</strong>
                </div>
                <a href={featuredGrant.grant.officialUrl} target="_blank" rel="noreferrer">
                  公式ページを見る
                </a>
              </div>
            </article>
          ) : (
            <article className="empty-card">
              <h3>条件に合う候補が見つかりませんでした。</h3>
              <p>用途または受付条件を少し広げると候補が出やすくなります。</p>
            </article>
          )}

          <div className="grant-list">
            {listGrants.map(({ grant, reasons, status }) => (
              <article key={grant.id} className="grant-card">
                <div className="grant-card-top">
                  <div className={`status-pill ${status.tone}`}>{status.label}</div>
                  <span>{grant.operator}</span>
                </div>

                <h3>{grant.name}</h3>
                <p className="grant-summary">{grant.summary}</p>

                <div className="fact-grid">
                  <div>
                    <small>補助額</small>
                    <strong>{grant.subsidyRange}</strong>
                  </div>
                  <div>
                    <small>補助率</small>
                    <strong>{grant.subsidyRate}</strong>
                  </div>
                  <div>
                    <small>申請期間</small>
                    <strong>{grant.applicationWindow.windowLabel}</strong>
                  </div>
                  <div>
                    <small>向いている用途</small>
                    <strong>{grant.tags.join(' / ')}</strong>
                  </div>
                </div>

                <div className="reason-box">
                  <strong>この条件に近い理由</strong>
                  <ul>
                    {(reasons.length > 0 ? reasons : ['用途と条件に近い制度です。']).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="caution-box">
                  <strong>確認ポイント</strong>
                  <p>{grant.keyCaution}</p>
                </div>

                <div className="card-footer">
                  <div>
                    <small>最終確認</small>
                    <strong>{grant.verifiedAt}</strong>
                  </div>
                  <div className="footer-links">
                    <a href={grant.officialUrl} target="_blank" rel="noreferrer">
                      公式ページ
                    </a>
                    <a href={grant.sourceUrl} target="_blank" rel="noreferrer">
                      根拠ソース
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="insight-strip">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Popular Themes</p>
              <h2>よくある検討テーマ</h2>
            </div>
          </div>

          <div className="insight-grid">
            {purposeCounts.map((option) => (
              <button
                type="button"
                key={option.key}
                className={answers.purpose === option.key ? 'insight-card active' : 'insight-card'}
                onClick={() => setAnswers((current) => ({ ...current, purpose: option.key }))}
              >
                <strong>{option.label}</strong>
                <p>{option.caption}</p>
                <span>{option.count}制度を収録</span>
              </button>
            ))}
          </div>
        </section>

        <section className="regional-support" id="regional-support">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Regional Support</p>
              <h2>{answers.prefecture} で次に見るべき公式窓口</h2>
            </div>
          </div>

          <div className="support-grid">
            {regionalLinks.map((link) => (
              <article key={`${link.name}-${link.url}`} className="support-card">
                <p className="mini-label">{link.operator}</p>
                <h3>{link.name}</h3>
                <p>{link.description}</p>
                <a href={link.url} target="_blank" rel="noreferrer">
                  公式サイトへ
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="methodology" id="methodology">
          <div className="panel-head">
            <div>
              <p className="section-kicker">Methodology</p>
              <h2>このポータルの掲載方針</h2>
            </div>
          </div>

          <div className="method-grid">
            <article>
              <h3>正確性を優先</h3>
              <p>
                全国の自治体制度を無差別に並べるのではなく、まずは国の主要制度を公式ソースでカード化しました。
                各カードに最終確認日を表示し、根拠ソースへ直接飛べます。
              </p>
            </article>
            <article>
              <h3>申請実務まで意識</h3>
              <p>
                補助額の大きさだけでなく、受付前か、締切が近いか、何を追加確認すべきかまでまとめています。
                補助金名鑑ではなく、申請判断の入口として設計しています。
              </p>
            </article>
            <article>
              <h3>拡張しやすい構成</h3>
              <p>
                次フェーズでは、自治体データの拡張、記事導線、専門家マッチング、Jグランツ連携を追加しやすいように、
                データ定義と表示ロジックを分けています。
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
