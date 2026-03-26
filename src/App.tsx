import { useMemo, useState } from 'react'
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

const defaultAnswers: Answers = {
  purpose: 'dx-ai',
  employeeBand: '6-20',
  budgetBand: '100-500',
  prefecture: '東京都',
  urgency: 'include-upcoming',
}

const defaultOccupation: OccupationKey = 'business-owner'
const defaultIncome: IncomeKey = '300-700'

const employeeLabels: Record<EmployeeBand, string> = {
  startup: '創業前〜創業1年以内',
  '1-5': '1〜5名',
  '6-20': '6〜20名',
  '21-50': '21〜50名',
  '51+': '51名以上',
}

const budgetLabels: Record<BudgetBand, string> = {
  '<100': '100万円未満',
  '100-500': '100〜500万円',
  '500-1000': '500〜1,000万円',
  '1000+': '1,000万円超',
}

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
    caption: '創業準備や小さな販促から始めたい',
    recommendedPurpose: 'startup',
    employeeBand: 'startup',
  },
  {
    key: 'freelancer',
    label: '個人事業主・フリーランス',
    caption: '販路開拓やIT導入を優先したい',
    recommendedPurpose: 'marketing',
    employeeBand: '1-5',
  },
  {
    key: 'small-owner',
    label: '小規模法人の代表',
    caption: '広告やWeb改善、小規模投資向け',
    recommendedPurpose: 'marketing',
    employeeBand: '1-5',
  },
  {
    key: 'business-owner',
    label: '中小企業の経営者',
    caption: 'DXや省力化を進めたい',
    recommendedPurpose: 'dx-ai',
    employeeBand: '6-20',
  },
  {
    key: 'growth-ceo',
    label: '成長企業の経営者',
    caption: '大型投資や新規事業を検討中',
    recommendedPurpose: 'new-business',
    employeeBand: '21-50',
  },
  {
    key: 'successor',
    label: '事業承継を検討中',
    caption: '承継・M&A・PMIの候補を見たい',
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

const todayLabel = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date())

function getGrantStatus(grant: Grant): GrantStatus {
  const now = new Date()
  const opensAt = grant.applicationWindow.opensAt ? new Date(grant.applicationWindow.opensAt) : null
  const closesAt = grant.applicationWindow.closesAt ? new Date(grant.applicationWindow.closesAt) : null

  if (grant.statusHint === 'upcoming' && !opensAt) {
    return { label: '公募予定', tone: 'upcoming', detail: `受付開始: ${grant.applicationWindow.openLabel}` }
  }

  if (closesAt && now > closesAt) {
    return { label: '公募終了', tone: 'closed', detail: `締切: ${grant.applicationWindow.closeLabel}` }
  }

  if (opensAt && now < opensAt) {
    return { label: '公募予定', tone: 'upcoming', detail: `受付開始: ${grant.applicationWindow.openLabel}` }
  }

  if (closesAt) {
    const oneDayMs = 24 * 60 * 60 * 1000
    if (closesAt.getTime() - now.getTime() <= oneDayMs) {
      return { label: '締切間近', tone: 'closing', detail: `締切: ${grant.applicationWindow.closeLabel}` }
    }

    return { label: '公募中', tone: 'open', detail: `締切: ${grant.applicationWindow.closeLabel}` }
  }

  return { label: '公開中', tone: 'open', detail: grant.applicationWindow.closeLabel }
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
    reasons.push(`${employeeLabels[answers.employeeBand]}に近い事業者向けの制度です。`)
  }

  if (grant.budgetBands.includes(answers.budgetBand)) {
    score += 16
    reasons.push(`想定投資規模 ${budgetLabels[answers.budgetBand]} と相性があります。`)
  }

  if (grant.availableIn.includes('全国') || grant.availableIn.includes(answers.prefecture)) {
    score += 10
    reasons.push(grant.availableIn.includes('全国') ? '全国から申請対象を確認できます。' : `${answers.prefecture} 向け制度です。`)
  }

  if (answers.urgency === 'open-now') {
    const status = getGrantStatus(grant)
    if (status.tone === 'upcoming') score -= 24
    if (status.tone === 'closed') score = -999
  }

  return { score, reasons }
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

function getPurposeTone(grant: Grant) {
  if (grant.purposeKeys.includes('dx-ai')) return 'blue'
  if (grant.purposeKeys.includes('marketing')) return 'green'
  if (grant.purposeKeys.includes('labor-saving')) return 'teal'
  if (grant.purposeKeys.includes('inheritance')) return 'amber'
  if (grant.purposeKeys.includes('startup')) return 'violet'
  return 'navy'
}

function filterRegionalLinks(prefecture: string) {
  return regionalSupportLinks.filter((link) => link.prefectures.includes('全国') || link.prefectures.includes(prefecture))
}

function App() {
  const [occupation, setOccupation] = useState(defaultOccupation)
  const [incomeBand, setIncomeBand] = useState(defaultIncome)
  const [answers, setAnswers] = useState(defaultAnswers)

  const rankedGrants = useMemo(
    () =>
      grants
        .map((grant) => {
          const ranking = scoreGrant(grant, answers)
          return {
            grant,
            reasons: ranking.reasons.slice(0, 2),
            score: ranking.score,
            status: getGrantStatus(grant),
          }
        })
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score),
    [answers],
  )

  const regionalLinks = filterRegionalLinks(answers.prefecture)
  const activePurpose = purposeOptions.find((option) => option.key === answers.purpose)
  const activeOccupation = occupationOptions.find((option) => option.key === occupation)
  const topGrant = rankedGrants[0]

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
    <div className="subsidy-page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-main">SubsidyMatch</span>
            <span className="brand-accent">.JP</span>
          </div>

          <nav className="header-nav">
            <a href="#finder">補助金を探す</a>
            <a href="#results">おすすめ一覧</a>
            <a href="#support">専門窓口</a>
          </nav>

          <div className="header-actions">
            <button type="button" className="header-button muted">
              ログイン
            </button>
            <button type="button" className="header-button primary">
              無料登録
            </button>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-inner">
          <p className="hero-badge">公式ソース確認済みの主要制度を掲載</p>
          <h1>
            自分に合う補助金が
            <br />
            <span>すぐ見つかる</span>
          </h1>
          <p className="hero-description">
            職業や年収の目安を選ぶだけで、今の状況に近い補助金候補を自動で整理します。
            面倒な制度比較を、わかりやすいカード形式にまとめました。
          </p>
          <a href="#finder" className="hero-cta">
            無料で補助金診断をはじめる
          </a>
          <p className="hero-note">※ 会員登録なしで候補一覧まで確認できます</p>
        </div>
      </section>

      <main className="main-shell">
        <aside className="finder-panel" id="finder">
          <h2>条件で絞り込む</h2>

          <div className="finder-group">
            <label>あなたの立場</label>
            <div className="option-list">
              {occupationOptions.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  className={occupation === option.key ? 'option-card active' : 'option-card'}
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
          </div>

          <div className="finder-group">
            <label>年収の目安</label>
            <div className="inline-options">
              {incomeOptions.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  className={incomeBand === option.key ? 'pill-button active' : 'pill-button'}
                  onClick={() => {
                    setIncomeBand(option.key)
                    applyPreset(occupation, option.key, false)
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="finder-group">
            <label>解決したい課題・目的</label>
            <select value={answers.purpose} onChange={(event) => setAnswers((current) => ({ ...current, purpose: event.target.value as PurposeKey }))}>
              {purposeOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="finder-group">
            <label>従業員規模</label>
            <select
              value={answers.employeeBand}
              onChange={(event) => setAnswers((current) => ({ ...current, employeeBand: event.target.value as EmployeeBand }))}
            >
              {Object.entries(employeeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="finder-group">
            <label>所在地</label>
            <select value={answers.prefecture} onChange={(event) => setAnswers((current) => ({ ...current, prefecture: event.target.value }))}>
              {prefectures.map((prefecture) => (
                <option key={prefecture} value={prefecture}>
                  {prefecture}
                </option>
              ))}
            </select>
          </div>

          <div className="finder-group">
            <label>公募ステータス</label>
            <div className="inline-options">
              <button
                type="button"
                className={answers.urgency === 'open-now' ? 'pill-button active' : 'pill-button'}
                onClick={() => setAnswers((current) => ({ ...current, urgency: 'open-now' }))}
              >
                公募中を優先
              </button>
              <button
                type="button"
                className={answers.urgency === 'include-upcoming' ? 'pill-button active' : 'pill-button'}
                onClick={() => setAnswers((current) => ({ ...current, urgency: 'include-upcoming' }))}
              >
                公募予定も含める
              </button>
            </div>
          </div>

          <div className="finder-summary">
            <strong>{activeOccupation?.label}</strong>
            <p>{incomeOptions.find((option) => option.key === incomeBand)?.label} / {activePurpose?.label}</p>
            <span>{rankedGrants.length}件の候補</span>
          </div>
        </aside>

        <section className="results-panel" id="results">
          <div className="results-head">
            <div>
              <h2>
                おすすめの補助金 <span>{rankedGrants.length}</span>件
              </h2>
              <p>{todayLabel} 時点で確認した主要制度を表示しています。</p>
            </div>
          </div>

          {topGrant ? (
            <article className="top-pick">
              <div className="top-pick-copy">
                <span className={`status-chip ${topGrant.status.tone}`}>{topGrant.status.label}</span>
                <h3>{topGrant.grant.name}</h3>
                <p>{topGrant.grant.summary}</p>
              </div>
              <div className="top-pick-meta">
                <div>
                  <small>最大受給イメージ</small>
                  <strong>{topGrant.grant.subsidyRange}</strong>
                </div>
                <div>
                  <small>今の状況</small>
                  <strong>{topGrant.status.detail}</strong>
                </div>
              </div>
            </article>
          ) : null}

          <div className="grant-list">
            {rankedGrants.map(({ grant, reasons, status }) => (
              <article key={grant.id} className={`grant-card tone-${getPurposeTone(grant)}`}>
                <div className="grant-card-accent" />
                <div className="grant-card-body">
                  <div className="grant-card-head">
                    <div>
                      <div className="grant-chip-row">
                        <span className={`category-chip tone-${getPurposeTone(grant)}`}>{grant.tags[0]}</span>
                        <span className={`status-chip ${status.tone}`}>{status.label}</span>
                      </div>
                      <h3>{grant.name}</h3>
                    </div>

                    <div className="grant-amount">
                      <small>最大受給額</small>
                      <strong>{grant.subsidyRange}</strong>
                    </div>
                  </div>

                  <p className="grant-description">{grant.summary}</p>

                  <div className="grant-meta-grid">
                    <div>
                      <span>補助率</span>
                      <strong>{grant.subsidyRate}</strong>
                    </div>
                    <div>
                      <span>申請期間</span>
                      <strong>{grant.applicationWindow.windowLabel}</strong>
                    </div>
                  </div>

                  <div className="grant-reasons">
                    <span>対象: {employeeLabels[answers.employeeBand]} に近い事業者</span>
                    {reasons.map((reason) => (
                      <span key={reason}>{reason}</span>
                    ))}
                  </div>

                  <div className="grant-footer">
                    <div className="grant-caution">{grant.keyCaution}</div>
                    <div className="grant-links">
                      <a href={grant.officialUrl} target="_blank" rel="noreferrer">
                        公式ページ
                      </a>
                      <a href={grant.sourceUrl} target="_blank" rel="noreferrer">
                        根拠ソース
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <section className="support-section" id="support">
        <div className="support-inner">
          <div className="support-head">
            <h2>{answers.prefecture} で次に見るべき公式窓口</h2>
            <p>補助金の最終判断は、各公式窓口と公募要領で確認してください。</p>
          </div>

          <div className="support-grid">
            {regionalLinks.map((link) => (
              <article key={link.url} className="support-card">
                <span>{link.operator}</span>
                <h3>{link.name}</h3>
                <p>{link.description}</p>
                <a href={link.url} target="_blank" rel="noreferrer">
                  公式サイトへ
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
