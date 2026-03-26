import { useState } from 'react'
import './App.css'
import { grants, prefectures, purposeOptions, regionalSupportLinks, type BudgetBand, type EmployeeBand, type Grant, type PurposeKey } from './data'

type UrgencyMode = 'open-now' | 'include-upcoming'

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

function App() {
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

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">SME Subsidy Navigator</p>
          <h1>選択肢を埋めるだけで、今の会社に近い補助金候補を絞り込む。</h1>
          <p className="hero-lead">
            経産省・中小企業庁系の主要制度を中心に、公式情報だけでカード化しました。各カードに
            「最終確認日」「申請期間」「公式URL」を付けて、補助金獲得だけを目的にしない使いやすい導線にしています。
          </p>
          <div className="hero-metrics">
            <div>
              <strong>8件</strong>
              <span>2026年3月26日時点で確認した主要制度</span>
            </div>
            <div>
              <strong>47都道府県</strong>
              <span>地域選択に応じて公式窓口へ誘導</span>
            </div>
            <div>
              <strong>{todayInJst}</strong>
              <span>この画面の閲覧日表示</span>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <p className="panel-kicker">精度ポリシー</p>
          <ul>
            <li>金額・締切・申請開始日は公式ページを起点に確認</li>
            <li>細かな適格要件はカード内の注意点と公式要領へのリンクで補完</li>
            <li>自治体案件は誤掲載を避けるため、まずは公式窓口導線を優先</li>
          </ul>
        </div>
      </header>

      <main className="content-grid">
        <section className="question-panel">
          <div className="section-heading">
            <p>3分診断</p>
            <h2>選ぶだけで候補を絞る</h2>
          </div>

          <div className="question-block">
            <label>何に使いたいですか？</label>
            <div className="chip-grid">
              {purposeOptions.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  className={answers.purpose === option.key ? 'chip active' : 'chip'}
                  onClick={() => setAnswers((current) => ({ ...current, purpose: option.key }))}
                >
                  <span>{option.label}</span>
                  <small>{option.caption}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="question-block">
            <label>従業員規模はどれに近いですか？</label>
            <div className="segmented">
              {Object.entries(employeeLabels).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  className={answers.employeeBand === key ? 'segment active' : 'segment'}
                  onClick={() => setAnswers((current) => ({ ...current, employeeBand: key as EmployeeBand }))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="question-block">
            <label>投資規模のイメージは？</label>
            <div className="segmented">
              {Object.entries(budgetLabels).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  className={answers.budgetBand === key ? 'segment active' : 'segment'}
                  onClick={() => setAnswers((current) => ({ ...current, budgetBand: key as BudgetBand }))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="question-row">
            <div className="question-block">
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
            </div>

            <div className="question-block">
              <label>受付状況</label>
              <div className="segmented stacked">
                <button
                  type="button"
                  className={answers.urgency === 'open-now' ? 'segment active' : 'segment'}
                  onClick={() => setAnswers((current) => ({ ...current, urgency: 'open-now' }))}
                >
                  今すぐ出せる案件を優先
                </button>
                <button
                  type="button"
                  className={answers.urgency === 'include-upcoming' ? 'segment active' : 'segment'}
                  onClick={() => setAnswers((current) => ({ ...current, urgency: 'include-upcoming' }))}
                >
                  受付前の案件も含める
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="results-panel">
          <div className="section-heading">
            <p>診断結果</p>
            <h2>{rankedGrants.length}件の候補を表示</h2>
          </div>

          {featuredGrant ? (
            <article className="featured-card">
              <div className="featured-meta">
                <span className={`status-pill ${featuredGrant.status.tone}`}>{featuredGrant.status.label}</span>
                <span>{featuredGrant.grant.operator}</span>
              </div>
              <h3>{featuredGrant.grant.name}</h3>
              <p>{featuredGrant.grant.summary}</p>
              <div className="featured-grid">
                <div>
                  <span>補助額</span>
                  <strong>{featuredGrant.grant.subsidyRange}</strong>
                </div>
                <div>
                  <span>補助率</span>
                  <strong>{featuredGrant.grant.subsidyRate}</strong>
                </div>
                <div>
                  <span>スケジュール</span>
                  <strong>{featuredGrant.status.detail}</strong>
                </div>
              </div>
            </article>
          ) : (
            <article className="empty-state">
              <h3>条件に合う候補が見つかりませんでした。</h3>
              <p>用途か受付状況を少し広げると、対象候補が出やすくなります。</p>
            </article>
          )}

          <div className="grant-list">
            {listGrants.map(({ grant, reasons, status }) => (
              <article key={grant.id} className="grant-card">
                <div className="grant-topline">
                  <span className={`status-pill ${status.tone}`}>{status.label}</span>
                  <span>{grant.operator}</span>
                </div>
                <h3>{grant.name}</h3>
                <p className="grant-summary">{grant.summary}</p>

                <dl className="grant-facts">
                  <div>
                    <dt>補助額</dt>
                    <dd>{grant.subsidyRange}</dd>
                  </div>
                  <div>
                    <dt>補助率</dt>
                    <dd>{grant.subsidyRate}</dd>
                  </div>
                  <div>
                    <dt>申請期間</dt>
                    <dd>{grant.applicationWindow.windowLabel}</dd>
                  </div>
                  <div>
                    <dt>向いている用途</dt>
                    <dd>{grant.tags.join(' / ')}</dd>
                  </div>
                </dl>

                <div className="reason-box">
                  <strong>この条件に近い理由</strong>
                  <ul>
                    {reasons.map((reason) => (
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
                    <span>最終確認</span>
                    <strong>{grant.verifiedAt}</strong>
                  </div>
                  <div className="card-actions">
                    <a href={grant.officialUrl} target="_blank" rel="noreferrer">
                      公式ページを見る
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
      </main>

      <section className="support-strip">
        <div className="section-heading">
          <p>地域導線</p>
          <h2>{answers.prefecture} で次に見るべき公式窓口</h2>
        </div>
        <div className="support-grid">
          {regionalLinks.map((link) => (
            <article key={`${link.name}-${link.url}`} className="support-card">
              <p className="support-operator">{link.operator}</p>
              <h3>{link.name}</h3>
              <p>{link.description}</p>
              <a href={link.url} target="_blank" rel="noreferrer">
                公式サイトへ
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="source-panel">
        <div className="section-heading">
          <p>掲載範囲</p>
          <h2>このMVPで意図的にやっていること</h2>
        </div>
        <div className="policy-grid">
          <article>
            <h3>正確性を優先</h3>
            <p>
              全国の自治体助成金を雑に網羅せず、まずは国の主要制度を正確に整理しました。自治体は
              公式窓口への導線を優先し、誤掲載リスクを下げています。
            </p>
          </article>
          <article>
            <h3>申請前提で見せる</h3>
            <p>
              補助額だけでなく、受付前か・本日締切か・注意点は何かを同時に表示します。補助金だけを
              追うサイトではなく、申請実務に入れる情報配置です。
            </p>
          </article>
          <article>
            <h3>次の拡張余地</h3>
            <p>
              次フェーズでは、自治体API連携、Jグランツ検索連携、事業計画テンプレートの下書き生成を
              追加しやすい構成にしています。
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}

export default App
